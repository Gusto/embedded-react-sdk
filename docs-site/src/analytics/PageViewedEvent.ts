// A page-view analytics event: a typed object emitted through ./trackEvent rather than a
// raw call against the client. Page views are the only event the docs site emits; widen
// ./trackEvent to a union when more events are added.
export class PageViewedEvent {
  readonly name: string

  constructor(name: string) {
    this.name = name
  }
}
