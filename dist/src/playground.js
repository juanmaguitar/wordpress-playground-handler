import { createNodeFsMountHandler, loadNodeRuntime } from "@php-wasm/node";
import { bootWordPress, resolveWordPressRelease } from "@wp-playground/wordpress";
import { rootCertificates } from "tls";
import { compileBlueprint, runBlueprintSteps } from "@wp-playground/blueprints";
import { fetchFileAsFileObject } from "./utils.js";
// Move all logic into a function and export it
export async function createPlaygroundRequestHandler(blueprint) {
    const wpDetails = await resolveWordPressRelease("6.8");
    const wordPressZip = await fetchFileAsFileObject(wpDetails.releaseUrl, `${wpDetails.version}.zip`);
    const sqliteIntegrationPluginZip = await fetchFileAsFileObject("https://github.com/WordPress/sqlite-database-integration/archive/refs/heads/develop.zip", "sqlite.zip");
    const requestHandler = await bootWordPress({
        siteUrl: "http://localhost:8080",
        createPhpRuntime: async () => await loadNodeRuntime("8.3"),
        wordPressZip,
        sqliteIntegrationPluginZip,
        sapiName: "cli",
        createFiles: {
            "/internal/shared/ca-bundle.crt": rootCertificates.join("\n"),
        },
        phpIniEntries: {
            "openssl.cafile": "/internal/shared/ca-bundle.crt",
            allow_url_fopen: "1",
            disable_functions: "",
        },
        cookieStore: false,
    });
    const php = await requestHandler.getPrimaryPhp();
    php.mkdir("/wordpress/wp-content/database/");
    php.mount("/wordpress/wp-content/database/", createNodeFsMountHandler("./wordpress/database/"));
    php.mkdir("/wordpress/wp-content/mu-plugins/");
    php.mount("/wordpress/wp-content/mu-plugins/", createNodeFsMountHandler("./wordpress/mu-plugins/"));
    const compiledBlueprint = await compileBlueprint(blueprint);
    await runBlueprintSteps(compiledBlueprint, php);
    // Debug logs - consider removing or using proper logging
    // console.log(php.listFiles("/wordpress/wp-content/mu-plugins/"));
    // console.log(php.readFileAsText("/wordpress/wp-content/mu-plugins/extended-user-info-rest.php"));
    return requestHandler;
}
//# sourceMappingURL=playground.js.map