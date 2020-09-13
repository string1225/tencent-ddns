# Tencent Cloud DDNS

This is a Node.js based tool (docker image) for DDNS on Tencent Cloud.

## Use

You could run the code via Node.js runtime directly.

```
npm install

node main.js <Your Secure ID> <Your Secure Key> <Your Domain> <Checking Interval in Seconds(optional)>
```

You could also use the following commands to pull the docker image and run. You need to pass the secure ID, key and your domain to the docker via environment variable.

```
docker run -d --restart=always 
    -e secureId=<Your Secure ID>
    -e secureKey=<Your Secure Key>
    -e domain=<Your Domain>
    -e checkInterval=<Checking Interval in Seconds (optional)>
    -e debugLevel=<default/trace (optional)>
    -v <Your Local Folder>:/app/logs
    --name tencent-ddns
    string1225/tencent-ddns
```

The tool will use the secure ID and key to connect to Tencent Cloud and change the record of your domain to your current IP, which comes from [IP.cn](https://ip.cn).

You could also indicate the check interval, which is 1 minute by default.

The log will be store in */logs* folder.

## Compile

You could build the image by yourself as well:

```
docker build -t tencent-ddns .
```

