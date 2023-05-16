module.exports = {
  apps : [{
        name: "admin_api",
        script: "bin/www",
        watch: true,
        env_devdo: {
            "PORT": 2025,
            "NODE_ENV": "mode_test",
            "PLATFORM": "DO",
        },
        env_productiondo: {
            "PORT": 2025,
            "NODE_ENV": "mode_production",
            "PLATFORM": "DO",
        },
        env_devaws: {
            "PORT": 2025,
            "NODE_ENV": "mode_test",
            "PLATFORM": "AWS",
        },
        env_productionaws: {
            "PORT": 2025,
            "NODE_ENV": "mode_production",
            "PLATFORM": "AWS",
        }
      }]
}