
import speech_recognition as sr
from os import path
import sys
sys.stdout.reconfigure(encoding='utf-8')


out_label = "output:"


def get_text(pathname):
    try:
        AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), pathname)
        r = sr.Recognizer()
        with sr.AudioFile(AUDIO_FILE) as source:
            audio = r.record(source)
        try:
            texto = r.recognize_google(audio, language='es-CO')
            return out_label + texto
        except sr.UnknownValueError:
            return out_label + "Música-NoEspañol."
        except sr.RequestError:
            return "Error: request"
    except Exception as e:
        return f"Error: file {pathname} cannot be opened or is corrupted. Details: {str(e)}"


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python getText.py <audio_path>")
    else:
        result = get_text(sys.argv[1])
        print(result)
