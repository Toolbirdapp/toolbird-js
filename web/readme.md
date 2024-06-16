# @toolbird/web

Used to track events and identify users for Toolbird Analytics in the browser. This library works with all frameworks like NextJS, NuxtJS, VueJS, React, Solid etc.

### Usage

#### Initialize Toolbird

```js
import toolbird from '@toolbird/web';

toolbird.init({ domain: 'yourdomain.com' });
```

#### Track a custom event
```js

toolbird.track("cta_clicked", {
    position: `hero`,
    color: `purple`,
})
```

#### Register a page view
```js
toolbird.pageview()
```

API
---

### `init(options: ToolbirdOptions)`

#### `ToolbirdOptions`

| prop   | required | default                            | options | description                                                                      |
| :----- | :------: | :--------------------------------- | :------ | -------------------------------------------------------------------------------- |
| `domain` | ✓ | | String | The domain of your website, that you have from the Toolbird Dashboard
| `host` |          | https://api.toolbird.io/v1 | String  | Usefull for setting another host if proxing the tracking though your own domain. |
| `autoTrack` | | `true` | `true` or `false` | Disable auto tracking - this will disable pageviews automatically being tracked.

### `track(event: string, data: EventData)`

EventData is a object of keys with values of `string`, `number`, `boolean` or `Date`

### `identify(userId: string, data: IdentityData)`

IdentityData is a object of keys with values of `string`, `number`, `boolean` or `Date`,
there are 3 reserved keys that can only be `string`, those are `email`, `name` & `avatar`

It is recommeded to add `email`, `name` and `avatar` to get the most out of user profiles.

### Example

```js

const user = {
    id: "dcedab1d-1d61-407c-a2e8-5a3bcd6a9656",
    email: 'johnsmith@gmail.com',
    firstName: "John",
    avatarURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png"
}

toolbird.identify(user.id, {
    email: user.email,
    name: user.firstName,
    avatar: user.avatarURL
})
```

If you have questions, contact me at simon@toolbird.io
