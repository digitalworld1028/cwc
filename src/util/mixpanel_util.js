import mixpanel from 'mixpanel-browser';
import getS3UserId from '../reducer/utils';
mixpanel.init('4a69d81de4f38a4c66b93463365cc0bb');

// temporarily disable web mixpanel as we log inside lambda function

let env_check = process.env.NODE_ENV === 'production';
env_check = true

let actions = {
  identify: (id) => {
    if (env_check) mixpanel.identify(id);
  },
  alias: (id) => {
    if (env_check) mixpanel.alias(id);
  },
  track: (name, props) => {
    if (env_check) {
      mixpanel.identify(getS3UserId());
      mixpanel.track('web_' + name, props);
    }
  },
  track_ua: (name, props) => {
    if (env_check) {
      mixpanel.identify(getS3UserId());
      if (props) {
        props['subevent'] = 'ua_web_' + name;
      } else {
        props = {'subevent': 'ua_web_' + name};
      }
      mixpanel.track('user_activity', props);
    }
  },
  people: {
    set: (props) => {
      if (env_check) mixpanel.people.set(props);
    },
  },
};

export let Mixpanel = actions;
