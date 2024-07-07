import { rimraf } from 'rimraf';

// Define the deleteFile function with proper TypeScript annotations
const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await rimraf(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export default { deleteFile };
