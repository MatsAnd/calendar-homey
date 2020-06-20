'use strict';

const Homey = require('homey');
const moment = require('moment');
const tools = require('../lib/tools');

module.exports = async (app) => {
    // register condition flow cards
    const registerConditionFlowCards = async () => {
        new Homey.FlowCardCondition('event_ongoing')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'ongoing'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args));

        new Homey.FlowCardCondition('event_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'in'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args));

        new Homey.FlowCardCondition('any_event_ongoing')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_ongoing'))

        new Homey.FlowCardCondition('any_event_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_in'));

        new Homey.FlowCardCondition('event_stops_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'stops_in'))
            .getArgument('event')
            .registerAutocompleteListener((query, args) => onEventAutocomplete(query, args));
        
        new Homey.FlowCardCondition('any_event_stops_in')
            .register()
            .registerRunListener((args, state) => checkEvent(args, state, 'any_stops_in'));
    };

    const onEventAutocomplete = async (query, args) => {
        if (!app.variableMgmt.EVENTS) {
            app.log("onEventAutocomplete: Events not set yet. Nothing to show...");
            return Promise.reject(false);
        }
        else {
            if (query && query !== "") {
                var filtered = tools.filterIcalBySummary(app.variableMgmt.EVENTS, query)
                //app.log("onEventAutocomplete: Filtered events count: " + filtered.length);
                return Promise.resolve(getEventList(filtered));
            }
            else {
                //app.log("onEventAutocomplete: Events count: " + app.variableMgmt.EVENTS.length);
                return Promise.resolve(getEventList(app.variableMgmt.EVENTS));
            }
        }
    }

    const getEventList = (events) => {
		if (events.length === 0) {
			app.log("getEventList: No events. Returning empty array");
			return events;
		}

		return events.map(event => {
			let startStamp = "";
			let fullDayEvent = false;

			if (event.DTSTART_TIMESTAMP) {
				try {
					startStamp = moment(event.DTSTART_TIMESTAMP).format('DD.MM HH:mm')
				}
				catch (err) {
					app.log("getEventList: Failed to parse 'DTSTART_TIMESTAMP'", err);
					startStamp = "";
				}
			}
			else if (event.DTSTART_DATE) {
				try {
					fullDayEvent = true;
					startStamp = moment(event.DTSTART_DATE).format('DD.MM')
				}
				catch (err) {
					app.log("getEventList: Failed to parse 'DTSTART_DATE'", err);
					startStamp = "";
				}
			}

			let name = "";
			let description = "";

			if (startStamp === "") {
				name = event.SUMMARY;
			}
			else {
				name = `(${startStamp}) - ${event.SUMMARY}`;
			}

			if (event.RRULE) {
				description = Homey.__('conditions_event_description_recurring');
			}
			if (fullDayEvent) {
				if (description === "") {
					description = Homey.__('conditions_event_description_fullday');
				}
				else {
					description += " -- " + Homey.__('conditions_event_description_fullday');
				}
			}

			return { "id": event.UID, "name": name, "description": description };
		});
	}

    const checkEvent = async (args, state, type) => {
		let eventCondition = false;
		let filteredEvents;
		if (type === 'ongoing' || type === 'in' || type === 'stops_in') {
			filteredEvents = tools.filterIcalByUID(app.variableMgmt.EVENTS, args.event.id);
		}
		else if (type === 'any_ongoing' || type === 'any_in' || type === 'any_stops_in') {
			filteredEvents = app.variableMgmt.EVENTS;
		}
		if (!filteredEvents || !filteredEvents.length) {
			app.log("checkEvent: filteredEvents empty... Resolving with false");
			return Promise.resolve(false);
		}

		app.log("checkEvent: " + filteredEvents.length + " event")

		if (type === 'ongoing') {
			app.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
			eventCondition = isEventOngoing(filteredEvents);
			app.log("checkEvent: Ongoing? " + eventCondition);
		}
		else if (type === 'in') {
			app.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
			eventCondition = isEventIn(filteredEvents, args.when);
			app.log("checkEvent: Starting in " + args.when + " minutes or less? " + eventCondition);
		}
		else if (type === 'stops_in') {
			app.log("checkEvent: I got an event with UID '" + args.event.id + "' and SUMMARY '" + args.event.name + "'");
			eventCondition = willEventNotIn(filteredEvents, args.when);
			app.log("checkEvent: Stopping in less than " + args.when + " minutes? " + eventCondition);
		}
		else if (type === 'any_ongoing') {
			eventCondition = isEventOngoing(filteredEvents);
			app.log("checkEvent: Is any of the " + filteredEvents.length + " events ongoing? " + eventCondition);
		}
		else if (type === 'any_in') {
			eventCondition = isEventIn(filteredEvents, args.when);
			app.log("checkEvent: Is any of the " + filteredEvents.length + " events starting in " + args.when + " minutes or less? " + eventCondition);
		}
		else if (type === 'any_stops_in') {
			eventCondition = willEventNotIn(filteredEvents, args.when);
			app.log("checkEvent: Is any of the " + filteredEvents.length + " events stopping in " + args.when + " minutes or less? " + eventCondition);
		}

		return Promise.resolve(eventCondition);
    }

    const isEventOngoing = (events) => {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, true, true);

			if (Object.keys(timestamps).length !== 2) {
				return false;
			}

			let now = moment();
			let start = moment(timestamps.start);
			let stop = moment(timestamps.stop);
			let startDiff = now.diff(start, 'seconds');
			let stopDiff = now.diff(stop, 'seconds');
			let result = (startDiff >= 0 && stopDiff <= 0);
			app.log("isEventOngoing: " + startDiff + " seconds since start -- " + stopDiff + " seconds since stop -- Ongoing: " + result);
			return result;
		});
	}

	const isEventIn = (events, when) => {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, true, false);

			if (Object.keys(timestamps).length !== 1) {
				return false;
			}

			let now = moment();
			let start = moment(timestamps.start);
			let startDiff = now.diff(start, 'minutes');
			let result = (startDiff >= when && startDiff <= 0)
			app.log("isEventIn: " + startDiff + " mintes until start -- Expecting " + when + " minutes or less -- In: " + result);
			return result;
		});
	}

	const willEventNotIn = (events, when) => {
		return events.some(event => {
			let timestamps = tools.getTimestamps(event, false, true);
			const flipNumber = number => {
				if (number > 0)
					return -number;
				else if (number < 0)
					return Math.abs(number);
				else
					return 0;
			}

			if (Object.keys(timestamps).length !== 1) {
				return false;
			}

			let now = moment();
			let stop = moment(timestamps.stop);
			let stopDiff = flipNumber(now.diff(stop, 'minutes'));
			let result = (stopDiff < when && stopDiff >= 0);
			app.log("willEventNotIn: '" + event.SUMMARY + "' -- ", stop);
			app.log("willEventNotIn: " + stopDiff + " mintes until stop -- Expecting less than " + when + " minutes -- In: " + result);
			return result;
		});
	}

    await registerConditionFlowCards();
}