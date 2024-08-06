# Delete all files in the folder that include alert_id
""" folder_path = os.path.dirname(file_path)
    pattern = os.path.join(folder_path, f"*{alert_id}*")
    for file in glob.glob(pattern):
        os.remove(file) """
