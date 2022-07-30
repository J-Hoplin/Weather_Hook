Weather Hook for Discord and Slack
===
***
**[Discord](https://discord.com/)와 [Slack](https://slack.com/intl/ko-kr/) 플랫폼을 위한 웹훅 애플리케이션 소스코드입니다**
***
## JavaScript Module Dependency

- Hooks
  - axios

- Platforms
  - Discord : axios, node-schedule,discord.js
  - Slack : axios, node-schedule

## Required and Settings

### Open Weather Map API Key
- [Open Weather Map](https://openweathermap.org/) API Key가 요구됩니다.
- API Key를 취득한 다음 Hooks/config.json의 "api_key" 필드에 값을 넣어주세요

  ```
  "api_key" : "your_openweathermap_api_key"
  ```

### Web Hook URL

- Discord, Slack에서 구동할 각각의 Web Hook URL이 요구됩니다.
- 각 플랫폼의 config.json에 있는 "weather_hook_endpoints"필드에 `"(Web Hook URL)" : "(알림을 받고싶은 지역)"` 과 같이 Key-Value 타입의 값을 입력합니다.
  
  ```
  "weather_hooks_endpoints" : {
        "your_slack_or_discord_webhook_url" : "region"
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
<img src = "https://user-images.githubusercontent.com/45956041/181906118-326a57b6-851e-4cf8-b69d-cf19fc66f656.png" width="50%" height="50%"> 

### Slack
<img src = "https://user-images.githubusercontent.com/45956041/181906077-1de749f7-37ae-4f8b-b13c-3ea72ade45f0.png" width="50%" height="50%"> 

