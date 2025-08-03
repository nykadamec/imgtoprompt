import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Function to get local models information
async function getLocalModelsInfo() {
  try {
    const modelsDir = path.join(process.cwd(), 'models');
    
    // Ensure models directory exists
    try {
      await fs.access(modelsDir);
    } catch {
      await fs.mkdir(modelsDir, { recursive: true });
      return { models: [], totalSize: 0 };
    }

    const entries = await fs.readdir(modelsDir, { withFileTypes: true });
    const modelFolders = entries.filter(entry => entry.isDirectory());
    
    const models = [];
    let totalSize = 0;

    for (const folder of modelFolders) {
      const folderPath = path.join(modelsDir, folder.name);
      
      try {
        // Get folder stats
        const stats = await getDirectorySize(folderPath);
        const lastModified = await getLastModified(folderPath);
        
        models.push({
          name: folder.name.replace('_', '/'), // Convert back from filesystem safe name
          originalName: folder.name,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          fileCount: stats.fileCount,
          lastModified: lastModified,
          path: folderPath
        });
        
        totalSize += stats.size;
      } catch (error) {
        console.error(`Error reading model folder ${folder.name}:`, error);
      }
    }

    return {
      models: models.sort((a, b) => b.lastModified - a.lastModified), // Sort by most recent
      totalSize: totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      modelsDirectory: modelsDir
    };
  } catch (error) {
    console.error('Error getting local models info:', error);
    throw error;
  }
}

// Helper function to get directory size and file count
async function getDirectorySize(dirPath: string): Promise<{ size: number; fileCount: number }> {
  let totalSize = 0;
  let fileCount = 0;

  async function calculateSize(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        await calculateSize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
        fileCount++;
      }
    }
  }

  await calculateSize(dirPath);
  return { size: totalSize, fileCount };
}

// Helper function to get last modified time
async function getLastModified(dirPath: string): Promise<number> {
  const stats = await fs.stat(dirPath);
  return stats.mtime.getTime();
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// GET endpoint to retrieve local models information
export async function GET(request: NextRequest) {
  try {
    const modelsInfo = await getLocalModelsInfo();
    
    return NextResponse.json({
      success: true,
      ...modelsInfo,
      message: `Found ${modelsInfo.models.length} local models`
    });
  } catch (error) {
    console.error('Error retrieving local models:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve local models information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a specific model
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('model');
    
    if (!modelName) {
      return NextResponse.json(
        { error: 'Model name is required' },
        { status: 400 }
      );
    }

    const modelsDir = path.join(process.cwd(), 'models');
    const modelPath = path.join(modelsDir, modelName.replace('/', '_'));
    
    // Check if model exists
    try {
      await fs.access(modelPath);
    } catch {
      return NextResponse.json(
        { error: `Model '${modelName}' not found locally` },
        { status: 404 }
      );
    }

    // Remove the model directory
    await fs.rm(modelPath, { recursive: true, force: true });
    
    return NextResponse.json({
      success: true,
      message: `Model '${modelName}' removed successfully`,
      deletedPath: modelPath
    });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}