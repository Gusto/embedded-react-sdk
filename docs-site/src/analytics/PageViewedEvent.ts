// A page-view analytics event. Mirrors the event-object pattern in gusto-analytics'
// standard-analytics wrapper: an event is a typed object emitted through ./trackEvent,
// not a raw call against the client. Page views are the only event the docs site emits;
// widen ./trackEvent to a union when more events are added.
export class PageViewedEvent {
  readonly name: string

  constructor(name: string) {
    this.name = name
  }
}
