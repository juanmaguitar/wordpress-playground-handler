/**
 * Serverless-optimized version that loads dependencies dynamically
 * This version avoids bundling large WASM files in serverless functions
 */

export interface ServerlessPlaygroundOptions {
  blueprintPath?: string;
  blueprint?: any; // Blueprint type from @wp-playground/blueprints
  mountPaths?: {
    databasePath?: string;
    muPluginsPath?: string;
  };
}

export class ServerlessPlaygroundHandler {
  private static instance: Promise<any> | null = null;

  static async getInstance(options: ServerlessPlaygroundOptions = {}) {
    if (!this.instance) {
      this.instance = this.createInstance(options);
    }
    return this.instance;
  }

  private static async createInstance(options: ServerlessPlaygroundOptions) {
    try {
      // Dynamically import the heavy dependencies only when needed
      const [
        { getPlaygroundHandler },
        { PHPRequestHandler }
      ] = await Promise.all([
        import('./lib.js'),
        import('@php-wasm/universal')
      ]);

      console.log('🚀 Creating serverless Playground handler...');
      const handler = await getPlaygroundHandler(options);
      console.log('✅ Serverless Playground handler ready');
      
      return handler;
    } catch (error) {
      console.error('❌ Failed to create serverless handler:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Serverless Playground initialization failed: ${errorMessage}`);
    }
  }

  static async handleRequest(request: any, options?: ServerlessPlaygroundOptions) {
    const handler = await this.getInstance(options);
    return handler.request(request);
  }
}

export default ServerlessPlaygroundHandler;
