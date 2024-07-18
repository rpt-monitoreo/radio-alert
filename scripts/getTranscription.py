from faster_whisper import WhisperModel
import argparse
import torch
import os


def main():
    parser = argparse.ArgumentParser(
        description='Procesar un archivo de audio.')
    parser.add_argument('file_path', type=str,
                        help='Ruta del archivo de audio')
    args = parser.parse_args()
    file_path = args.file_path
    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "int8_float16" if device == "cuda" else "int8"

    model_size = "small"
    model = WhisperModel(model_size, device=device, compute_type=compute_type)

    segments, _ = model.transcribe(
        file_path, language="es", beam_size=1)

    texto = "".join(segment.text + " " for segment in segments)

    output_path = os.path.splitext(file_path)[0] + "_transcription.txt"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(texto)


if __name__ == '__main__':
    main()
