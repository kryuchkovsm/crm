/**
 * Created by user on 11.03.15.
 */
'use strict';

angular.module('EventsService', [])
  .factory('Events', ['$rootScope', '$interval',
  function($rootScope, $interval, GlobalVars) {
    var TIMER_TICK = 'timerTick',
        GOT_TOKEN = 'gotToken';

    var stop = undefined, timerInit, gotTokenEvent, onGotTokenEvent, onTimerTick;

    timerInit = function() {
      stop = $interval(function() {
        $rootScope.$emit(TIMER_TICK, {
          eventData: 'tick'
        });
      }, 1000);
    };

    gotTokenEvent = function (eventData) {
      $rootScope.$emit(GOT_TOKEN, {
        eventData: eventData
      });
    };

    onGotTokenEvent = function (handler) {
      // Returns an event de-register function
      return $rootScope.$on(GOT_TOKEN, function (event, eventData) {
        handler(eventData);
      });
    };


    onTimerTick = function (handler) {
      // Returns an event de-register function
      return $rootScope.$on(TIMER_TICK, function (event, eventData) {
        handler(eventData);
      });
    };

    // Return directly only functions and constants (whiteLabel), other things through function(){return {val: someobject};}
    return   {
      timerInit: timerInit,
      onTimerTick: onTimerTick,
      gotTokenEvent: gotTokenEvent,
      onGotTokenEvent: onGotTokenEvent
    }
  }]);
