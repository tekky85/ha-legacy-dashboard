const fs = require("fs");
const path = require("path");


function DashboardConfigStore(options) {

    this.configPath = options.configPath;
    this.backupPath = options.configPath + ".bak";
    this.defaultConfiguration = options.defaultConfiguration;
    this.validate = options.validate;
    this.clone = options.clone;

}


DashboardConfigStore.prototype.ensureDirectory = function () {

    fs.mkdirSync(
        path.dirname(this.configPath),
        {
            recursive: true,
            mode: 0o700
        }
    );

};


DashboardConfigStore.prototype.readConfiguration = function (filePath) {

    const content =
        fs.readFileSync(filePath, "utf8");

    const configuration =
        JSON.parse(content);

    this.validate(configuration);

    return this.clone(configuration);

};


DashboardConfigStore.prototype.fsyncDirectory = function () {

    let descriptor = null;


    try {
        descriptor = fs.openSync(
            path.dirname(this.configPath),
            "r"
        );
        fs.fsyncSync(descriptor);
    } finally {
        if (descriptor !== null) {
            fs.closeSync(descriptor);
        }
    }

};


DashboardConfigStore.prototype.writeTemporaryFile = function (
    targetPath,
    content
) {

    const temporaryPath =
        path.join(
            path.dirname(targetPath),
            "." +
                path.basename(targetPath) +
                "." +
                process.pid +
                "." +
                Date.now() +
                ".tmp"
        );

    let descriptor = null;


    try {
        descriptor = fs.openSync(
            temporaryPath,
            "wx",
            0o600
        );
        fs.writeFileSync(
            descriptor,
            content,
            "utf8"
        );
        fs.fsyncSync(descriptor);
        fs.closeSync(descriptor);
        descriptor = null;

        return temporaryPath;
    } catch (error) {
        if (descriptor !== null) {
            fs.closeSync(descriptor);
        }

        try {
            fs.unlinkSync(temporaryPath);
        } catch (cleanupError) {
            if (cleanupError.code !== "ENOENT") {
                throw cleanupError;
            }
        }

        throw error;
    }

};


DashboardConfigStore.prototype.writePrimaryOnly = function (
    configuration
) {

    const serialized =
        JSON.stringify(configuration, null, 2) + "\n";

    let temporaryPath = null;


    this.ensureDirectory();


    try {
        temporaryPath =
            this.writeTemporaryFile(
                this.configPath,
                serialized
            );

        fs.renameSync(
            temporaryPath,
            this.configPath
        );
        temporaryPath = null;

        fs.chmodSync(this.configPath, 0o600);
        this.fsyncDirectory();
    } finally {
        if (temporaryPath) {
            try {
                fs.unlinkSync(temporaryPath);
            } catch (cleanupError) {
                if (cleanupError.code !== "ENOENT") {
                    throw cleanupError;
                }
            }
        }
    }

};


DashboardConfigStore.prototype.load = function () {

    if (fs.existsSync(this.configPath)) {

        try {
            return {
                configuration:
                    this.readConfiguration(
                        this.configPath
                    ),
                migrated: false,
                recovered: false
            };
        } catch (primaryError) {

            if (!fs.existsSync(this.backupPath)) {
                throw primaryError;
            }

            const backupConfiguration =
                this.readConfiguration(
                    this.backupPath
                );

            this.writePrimaryOnly(
                backupConfiguration
            );

            return {
                configuration:
                    this.clone(
                        backupConfiguration
                    ),
                migrated: false,
                recovered: true
            };

        }

    }


    if (fs.existsSync(this.backupPath)) {

        const backupConfiguration =
            this.readConfiguration(
                this.backupPath
            );

        this.writePrimaryOnly(
            backupConfiguration
        );

        return {
            configuration:
                this.clone(
                    backupConfiguration
                ),
            migrated: false,
            recovered: true
        };

    }


    this.validate(
        this.defaultConfiguration
    );

    const migratedConfiguration =
        this.clone(
            this.defaultConfiguration
        );

    this.writePrimaryOnly(
        migratedConfiguration
    );

    return {
        configuration: migratedConfiguration,
        migrated: true,
        recovered: false
    };

};


DashboardConfigStore.prototype.save = function (configuration) {

    this.validate(configuration);

    const normalized =
        this.clone(configuration);

    const serialized =
        JSON.stringify(normalized, null, 2) + "\n";

    let primaryTemporaryPath = null;
    let backupTemporaryPath = null;


    this.ensureDirectory();


    try {
        primaryTemporaryPath =
            this.writeTemporaryFile(
                this.configPath,
                serialized
            );


        if (fs.existsSync(this.configPath)) {

            const currentConfiguration =
                this.readConfiguration(
                    this.configPath
                );

            backupTemporaryPath =
                this.writeTemporaryFile(
                    this.backupPath,
                    JSON.stringify(
                        currentConfiguration,
                        null,
                        2
                    ) + "\n"
                );

            fs.renameSync(
                backupTemporaryPath,
                this.backupPath
            );
            backupTemporaryPath = null;
            fs.chmodSync(this.backupPath, 0o600);

        }


        fs.renameSync(
            primaryTemporaryPath,
            this.configPath
        );
        primaryTemporaryPath = null;
        fs.chmodSync(this.configPath, 0o600);
        this.fsyncDirectory();

        return this.clone(normalized);
    } finally {

        [
            primaryTemporaryPath,
            backupTemporaryPath
        ].forEach(function (temporaryPath) {

            if (!temporaryPath) {
                return;
            }

            try {
                fs.unlinkSync(temporaryPath);
            } catch (cleanupError) {
                if (cleanupError.code !== "ENOENT") {
                    throw cleanupError;
                }
            }

        });

    }

};


module.exports = DashboardConfigStore;
