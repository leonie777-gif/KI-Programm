import os
os.environ["MKL_VERBOSE"] = "0"
os.environ["MKL_WARNINGS"] = "0"

import sys
from faster_whisper import WhisperModel

def main():
    audio_path = sys.argv[1]
    model = WhisperModel("base")
    segments, info = model.transcribe(audio_path, language="de")

    text = " ".join(seg.text for seg in segments)
    print(text)

if __name__ == "__main__":
    main()
