# ip-mapping

This is a node based tool for DDNS on Tencent Cloud.

According to config_sample.js, you need to create the config.js to store the security information.

Then, run the docker image builder.

```
docker build -t ip-mapping .
```

Run the docker image.

```
docker run -d --restart=always ip-mapping
```