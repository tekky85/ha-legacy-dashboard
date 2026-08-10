const fs = require("fs");
const path = require("path");


function DashboardConfigStore(options) {

    this.configPath = options.configPath;
    this.backupPath = options.configPath + ".bak";
    this.defaultConfiguration = options.defaultConfiguration;
    this.validate = options.validate;
    this.clone = options.clone;
    this.migrate = options.migrate || function (configuration) {
        return {
            configuration: configuration,
            migrated: false
        };
    };

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

    const parsed =
        JSON.parse(content);

    const migration =
        this.migrate(parsed);

    const configuration =
        migration.configuration;

    this.validate(configuration);

    return {
        configuration:
            this.clone(configuration),
        migrated:
            migration.migrated === true,
        sourceConfiguration: parsed
    };

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
            const primary =
                this.readConfiguration(
                    this.configPath
                );

            return {
                configuration:
                    primary.migrated
                        ? this.save(
                            primary.configuration,
                            primary.sourceConfiguration
                        )
                        : primary.configuration,
                migrated: primary.migrated,
                recovered: false
            };
        } catch (primaryError) {

            if (!fs.existsSync(this.backupPath)) {
                throw primaryError;
            }

            const backup =
                this.readConfiguration(
                    this.backupPath
                );

            this.writePrimaryOnly(
                backup.configuration
            );

            return {
                configuration:
                    this.clone(
                        backup.configuration
                    ),
                migrated: backup.migrated,
                recovered: true
            };

        }

    }


    if (fs.existsSync(this.backupPath)) {

        const backup =
            this.readConfiguration(
                this.backupPath
            );

        this.writePrimaryOnly(
            backup.configuration
        );

        return {
            configuration:
                this.clone(
                    backup.configuration
                ),
            migrated: backup.migrated,
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


DashboardConfigStore.prototype.save = function (
    configuration,
    backupConfiguration
) {

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

            const previous =
                typeof backupConfiguration !== "undefined"
                    ? backupConfiguration
                    : this.readConfiguration(
                        this.configPath
                    ).configuration;

            backupTemporaryPath =
                this.writeTemporaryFile(
                    this.backupPath,
                    JSON.stringify(
                        previous,
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
