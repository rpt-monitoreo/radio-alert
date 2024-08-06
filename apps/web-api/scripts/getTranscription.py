from faster_whisper import WhisperModel
from pymongo import MongoClient
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

    model_size = "large-v3"
    model = WhisperModel(model_size, device=device, compute_type=compute_type)

    segments, _ = model.transcribe(
        file_path, language="es", beam_size=1)

    texto = "".join(segment.text + " " for segment in segments)

    alert_id = os.path.splitext(file_path)[0].split("_")[1]
    # Connect to MongoDB
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db[collection_name]

    # Check if a document with the given alert_id exists
    existing_document = collection.find_one({"alert_id": alert_id})

    if existing_document:
        # Update the document by appending the new note
        collection.update_one(
            {"alert_id": alert_id},
            {"$set": {"text": texto}}
        )
        note_id = existing_document["_id"]
    else:
        # Create a new document
        new_document = {
            "alert_id": alert_id,
            "text": texto,
            # Add other fields as necessary
        }
        result = collection.insert_one(new_document)
        note_id = result.inserted_id

    client.close()


if __name__ == '__main__':
    mongo_uri = 'mongodb://localhost:27017/'
    db_name = "monitoring"
    collection_name = "note"
    main()
