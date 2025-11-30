import * as path from "path";

export function getDateFromFile(filePath: string): Date {
  const fileName = path.basename(filePath);
  const parts = fileName.split("_");
  if (parts.length < 3) throw new Error("Invalid file name format.");
  return new Date(
    `${parts[1]}T${parts[2].split(".")[0].replace(/-/g, ":")}.000-05:00`
  );
}
