### Usage
#### iRacingBrowserApps
1) Install iRacingBrowserApps
2) Start `server.exe`

#### Kapps
1) Start kapps

#### Code
```
const extender = CautionExtender()
extender.on(CautionExtenderEvents.Extend, () => {
  console.log("Notify iRacing to extend the caution!")
})
```
