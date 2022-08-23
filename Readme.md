Weather Hook for Discord and Slack
===
***
**[Discord](https://discord.com/)와 [Slack](https://slack.com/intl/ko-kr/) 플랫폼을 위한 날씨/대기 정보 웹훅 애플리케이션 소스코드입니다**
***
## JavaScript Module Dependency

- Hooks
  - axios

- Platforms
  - Discord : axios, node-schedule,discord.js
  - Slack : axios, node-schedule

***
## How to use?

1. Git Clone

  ```bash
  git clone https://github.com/J-hoplin1/Weather_Hook.git && cd Weather_Hook
  ```

2. Configure step by step, refer to ["Required and Settings"](https://github.com/J-hoplin1/Weather_Hook#required-and-settings) under below

3. Install dependencies

  ```bash
  npm run build-env
  ```

4. Execute bot

  ```bash
  # Discord
  npm run execute-discord

  #Slack
  npm run execute-slack
  ```
***
## Required and Settings

**하나의 Web Hook URL당 최대 도시 기반 날씨대기정보 1개, 좌표기반 날씨 대기정보 1개만 허용이 됩니다**

### Open Weather Map API Key
- [Open Weather Map](https://openweathermap.org/) API Key가 요구됩니다.
- API Key를 취득한 다음 Hooks/config.json의 "api_key" 필드에 값을 넣어주세요

  ```
  "api_key" : "your_openweathermap_api_key"
  ```

### 도시 기반 날씨/대기정보

- Discord, Slack에서 구동할 각각의 Web Hook URL이 요구됩니다.
- 각 플랫폼의 config.json에 있는 "weather_hook_endpoints"필드에 `"(Web Hook URL)" : "(알림을 받고싶은 지역 영문명, 서울이면 seoul)"` 과 같이 Key-Value 타입의 값을 입력합니다.
- 지원되지 않는 도시가 있을 수 있습니다. 지원되는 도시는 Hooks/config.json에서 확인하실 수 있으며, 빠른시일 내에 더 추가할 예정입니다.
  
  ```
  "weather_hooks_endpoints" : {
        "your_slack_or_discord_webhook_url" : "region"
   }
  ```
### 좌표 기반 날씨/대기정보

- Discord,Slack에서 구동할 각각의 Web Hook URL이 요구됩니다. 추가적으로, 지정하고자 하는 장소의 좌표가 요구됩니다
- 각 플랫폼의 config.json에 있는 "custom_weather_hooks_endpoints" 필드에 `"(Web hook URL)" : ["지정한 장소의 별명 혹은 명칭", "위도","경도"]`와 같이 Key-value타입의 값을 입력합니다. Value부분의 3개 필드 모두 필수사항이며, 순서 또한 맞춰주셔야 합니다

  ```
  "custom_weather_hooks_endpoints" : {
        "your_slack_or_discord_webhook_url" : ["Nickname of the place","lat", "lon"]
    }
  ```

### Setting Scheduler

- 알림을 받고 싶은 주기를 설정해야합니다.
- 각 플랫폼의 config.json에 있는 "scheduler_expression" 필드에 crontab expression으로 주기를 설정해 주어야 합니다

  ```
  "scheduler_expression":"* * * * * *"
  ```

- Crontab작성시 도움이 되는 사이트 : https://crontab.guru/
***
## 아래와 같이 동작합니다
### Discord
<img src = "https://user-images.githubusercontent.com/45956041/181906118-326a57b6-851e-4cf8-b69d-cf19fc66f656.png" width="40%" height="40%"> <img width="40%" height="40%" alt="image" src="https://user-images.githubusercontent.com/45956041/182166395-fd0078fc-140f-490a-bb3a-b8fcf68d728b.png">

### Slack
<img src = "https://user-images.githubusercontent.com/45956041/181906077-1de749f7-37ae-4f8b-b13c-3ea72ade45f0.png" width="40%" height="40%"> <img width="40%" height="40%" alt="image" src="https://user-images.githubusercontent.com/45956041/182166127-086d39c8-2f8c-4acc-9729-c52e2a4f76d2.png">

