"""
MediaPipe Landmark Client Bridge for GlamAI.
Executes landmark detection inside the isolated MediaPipe environment (backend/venv_mediapipe_test)
to protect the production Flask environment from C-extension / dependency conflicts.
"""

import os
import sys
import json
import logging
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger("GlamAI.MediaPipeClient")


class MediaPipeClient:
    """
    Subprocess bridge client to the isolated MediaPipe runtime environment.
    Streams image bytes through standard input and receives structured landmark JSON.
    """

    def __init__(
        self,
        python_exe: Optional[str] = None,
        service_script: Optional[str] = None,
        timeout_seconds: int = 25
    ):
        base_dir = Path(__file__).resolve().parent.parent  # backend/

        if python_exe is None:
            # Default to isolated venv if present, otherwise fall back to current Python executable
            is_win = sys.platform == "win32"
            script_sub = "Scripts" if is_win else "bin"
            exe_name = "python.exe" if is_win else "python"
            isolated_exe = base_dir / "venv_mediapipe_test" / script_sub / exe_name
            if isolated_exe.is_file():
                python_exe = str(isolated_exe)
            else:
                python_exe = sys.executable

        if service_script is None:
            service_script = str(base_dir / "services" / "mediapipe_service.py")

        self.python_exe = python_exe
        self.service_script = service_script
        self.timeout_seconds = timeout_seconds

    def is_available(self) -> bool:
        """Verifies if the python runner and service script exist."""
        has_python = os.path.isfile(self.python_exe) or (self.python_exe == sys.executable)
        return has_python and os.path.isfile(self.service_script)

    def detect_landmarks(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Sends raw image bytes to the isolated MediaPipe service and returns structured result.
        Returns standardized dict with 'success', 'face_detected', 'landmarks', etc.
        """
        if not image_bytes or len(image_bytes) < 16:
            return {
                "success": False,
                "face_detected": False,
                "error": "No image data or file content too small.",
                "error_type": "INVALID_IMAGE",
                "status_code": 400
            }

        if not self.is_available():
            logger.error(
                "MediaPipe isolated environment not found at: %s or script: %s",
                self.python_exe,
                self.service_script
            )
            return {
                "success": False,
                "face_detected": False,
                "error": "MediaPipe isolated runtime environment is not configured or unavailable.",
                "error_type": "ENVIRONMENT_UNAVAILABLE",
                "status_code": 503
            }

        cmd = [self.python_exe, self.service_script, "-"]

        try:
            # Execute subprocess with stdin/stdout pipe
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            stdout_data, stderr_data = process.communicate(
                input=image_bytes,
                timeout=self.timeout_seconds
            )

            return_code = process.returncode

        except subprocess.TimeoutExpired:
            process.kill()
            logger.error("MediaPipe subprocess timed out after %ds", self.timeout_seconds)
            return {
                "success": False,
                "face_detected": False,
                "error": f"Facial landmark analysis timed out ({self.timeout_seconds}s limit).",
                "error_type": "TIMEOUT",
                "status_code": 504
            }
        except Exception as exc:
            logger.error("Subprocess execution failed: %s", exc)
            return {
                "success": False,
                "face_detected": False,
                "error": f"Failed to spawn MediaPipe worker: {str(exc)}",
                "error_type": "PROCESS_SPAWN_ERROR",
                "status_code": 500
            }

        # Parse JSON output from stdout
        raw_stdout = stdout_data.decode("utf-8", errors="replace").strip()
        if not raw_stdout:
            raw_stderr = stderr_data.decode("utf-8", errors="replace").strip()
            logger.error("Empty stdout from MediaPipe worker. Stderr: %s", raw_stderr)
            return {
                "success": False,
                "face_detected": False,
                "error": "MediaPipe worker returned an empty response.",
                "details": raw_stderr[:500] if raw_stderr else None,
                "status_code": 500
            }

        try:
            # In case of leading log text on stdout, extract bracketed JSON
            json_start = raw_stdout.find("{")
            json_end = raw_stdout.rfind("}")
            if json_start != -1 and json_end != -1 and json_end > json_start:
                clean_json_str = raw_stdout[json_start:json_end + 1]
                data = json.loads(clean_json_str)
            else:
                data = json.loads(raw_stdout)

            return data

        except json.JSONDecodeError as jde:
            logger.error("Failed to parse JSON from MediaPipe worker: %s. Output was: %s", jde, raw_stdout[:300])
            return {
                "success": False,
                "face_detected": False,
                "error": "Failed to decode landmark analysis response.",
                "raw_output": raw_stdout[:200],
                "status_code": 500
            }


# Singleton instance for application-wide reuse
mediapipe_client = MediaPipeClient()
