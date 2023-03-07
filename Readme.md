Weather Hook for Discord
===
***
**[Discord](https://discord.com/) 플랫폼을 위한 날씨/대기 정보 웹훅 애플리케이션 소스코드입니다**
***
## How to use?

0. Prepare [Openweather Map](https://openweathermap.org)'s API key. You need to  subscribe apis under below
    - [Weather Data](https://openweathermap.org/current)
    - [Airpollution Data](https://openweathermap.org/api/air-pollution)
    - [Geo-Coding Data](https://openweathermap.org/api/geocoding-api)
1. Git Clone

    ```bash
    git clone https://github.com/J-hoplin1/Weather_Hook.git && cd Weather_Hook
    ```

2. Complete application config. There are three types of config

    - scheduler : Crontab Expression
    - region : Please follow format as under below
        ```json
        ...
        "region" : [
            {
                "hook" : "Your discord web hook endpoint",
                "region" : "Supported Region (ex. 'seoul')"
            }
        ]
        ...
        ```
        - You can see supported region in this [link](./src/constant/region.ts)
    - specified : Please follow format as under below
        ```json
        ...
        "specified" : [
            {
                "hook" : "Your discord web hook endpoint",
                "location" :[
                    "latitude value as integer type",
                    "longtitude value as integer type",
                    "location name you want to set as string type"
                ]
            }
        ]
        ...
        ```
3.  Build docker
    ```bash
    docker build -t (image name) .
    ```
4. Run docker container. **Be aware that you need Openweather map API key in this step**

    - Mountable container volume
        - /app/dist/logfile : logfiles

    ```bash
    docker run -d --name (container name) -e OPENWEATHER_API_KEY='(your openweathermap API Key)' -v (location you want to mount):/app/dist/logfile (image name)
    ```



