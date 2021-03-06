# IcalCalendar

The IcalCalendar gives Homey flow cards to trigger on your calendar events

## Setup

- Open settings (configure app) and paste in the ical link

### Find Exchange Online ical link

1. Go to https://outlook.office.com/mail/inbox
1. Click settings -> Show all outlook setting
1. Go to Calendar -> Shared calenders
1. Publish a calendar, click the ics link and choose copy
1. Paste the ical link in settings of Homey app

### Find Gmail ical url

1. Go to https://calendar.google.com/
1. Click the three dots next to the calendar you want to share -> Click Settings and sharing
1. Scroll all the way down to the bottom
1. Copy the link from Secret address in ical format
1. Paste the ical link in settings of Homey app

### Find Apple iCloud url

1. Go to https://www.icloud.com/calendar/, or open the Calendar app on your iOS device
1. Click on the icon next to the calendar name in the left pane
1. Tick the checkbox for **Public calendar**
1. Copy the link
1. Paste the calendar link in the Homey app settings

## Usage

### Triggers
- **Event starts** - *will trigger when any event starts*
- **Event starts in** - *will trigger when any event starts in when specified*
- **Event stops** - *will trigger when any event stops*

### Conditions
- **Event is ongoing** - *will check if specified event is|isn't ongoing*
- **Event starts within** - *will check if specified event starts|doesn't start within when specified*
- **Event stops within** - *will check if specified event stops|doesn't stop within when specified*
- **Any event is ongoing** - *will check if any event is|isn't ongoing*
- **Any event starts within** - *will check if any event starts|doesn't start within when specified*
- **Any event stops within** - *will check if any event stops|doesn't stop within when specified*

### Actions
- **Sync calendars** - *will download new .ics files to update current events*

### Flow tokens on triggers
- Event title
- Event description
- Event location
- Event duration
- Event duration (mintes)
- Calendar name

### Global flow tokens (can be used in any app and service)
- Next event title
- Next event start time
- Next event stop time
- Next event duration
- Next event duration (minutes)
- Next event starts in (minutes)
- Next event stops in (minutes)
- Calendar name of next event
- Todays events, title and time
- Todays events (count)

## Recurring events

### Be aware of *multiple/duplicate* "recurring" events:
- On a recurring event, where one or more participants have declined, that specific event is detached from the recurring event and created as a separate non-recurring event. This will result in two similar events, both have the same name and date.

## Known bugs

- Searching events in condition card, returns no events when search query has a space followed with a character (Example: 'Test f')

## ToDo

## Changelog

- 0.1.1
    - Bugfix: [Typo in the Norwegian locale](https://github.com/runely/calendar-homey/issues/42)
    - Added more choices (timespan) for triggers and conditions
- 0.1.0
    - Added support for Mailfence (DTSTART;VALUE=DATE-TIME / DTEND;VALUE=DATE-TIME)
    - Added support for recurring events :D
    - Bugfix: Todays events did not show events with stop date greater than start date
    - Bugfix: Global tokens were not proparly set as empty before calendars were set
    - Bugfix: Flow tokens/triggers were evaluated even before any events existed
    - Condition event chooser rewritten
    - Event list sorted by start date
    - New icon
- 0.0.6
    - Added global flow tokens for next event and todays events -> Part of issue [Issue #7](https://github.com/runely/calendar-homey/issues/7)
    - Added token 'Calendar name' to 'Event starts' and 'Event stops' triggers
    - Added trigger 'Event starts in' -> [Issue #7](https://github.com/runely/calendar-homey/issues/7)
- 0.0.5
    - Added support for norwegian language -> [Issue #6](https://github.com/runely/calendar-homey/issues/6)
    - Added action for Sync calendar -> [Issue #3](https://github.com/runely/calendar-homey/issues/3)
    - Added duration tokens to trigger 'Event starts' -> [Issue #16](https://github.com/runely/calendar-homey/issues/16)
    - Added trigger 'Event stops' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added conditions 'Any event stops in...' and 'Event stops in...' -> [Issue #4](https://github.com/runely/calendar-homey/issues/4)
    - Added support for multiple calendars -> [Issue #17](https://github.com/runely/calendar-homey/issues/17)
    - Bugfix: "When Homey looses internet and tries to sync calendars, app crashes..." -> [Issue #20](https://github.com/runely/calendar-homey/issues/20)
- 0.0.4
    - Changelog moved out of readme...
- 0.0.3
    - Events in condition card is now presented with a date (and time if present) -> [Issue #2](https://github.com/runely/calendar-homey/issues/2)
    - Alert when settings saved -> [Issue #9](https://github.com/runely/calendar-homey/issues/9)
    - Show message in settings if uri fails to load
    - Importing only active events. This is a significantly performance improvement! -> [Issue #1](https://github.com/runely/calendar-homey/issues/1)
    - Event list in condition card shows if the event is recurring and/or full day
- 0.0.2: 
    - Bugfix: "triggerEvents" failed when events were not imported yet
    - Bugfix: Tokens are validated before set (replacing '\n' or '\r' or null with '')
    - Added trigger for any events started
    - Bugfix: "Event is ongoing" validated to true when a started event was missing a stop time
    - Updated README.txt with info from README.md (and make it look good)
    - Updated app.json/Description with a really well said sentence of what this app can do
    - Changed brandColor
- 0.0.1:
    - Initial version
