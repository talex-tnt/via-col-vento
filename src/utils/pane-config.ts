import {
  faBrush,
  faBug,
  faGear,
  faKeyboard,
  faStethoscope,
} from '@fortawesome/free-solid-svg-icons';
import {ConfigurePane} from '../components/panes/configure';
import {Debug} from '../components/panes/debug';
import {DesignTab} from '../components/panes/design';
import {Settings} from '../components/panes/settings';
import {Test} from '../components/panes/test';
import {ErrorsPaneConfig} from '../components/panes/errors';

// HACK: Using import.meta.env.BASE_URL as a workaround.
// This is not the proper fix and requires a larger refactor, which is not feasible at the moment.
const base = import.meta.env.BASE_URL;
export default [
  {
    key: 'default',
    component: ConfigurePane,
    icon: faKeyboard,
    title: 'Configure',
    path: `${base}`,
  },
  {
    key: 'test',
    component: Test,
    icon: faStethoscope,
    path: `${base}test`,
    title: 'Key Tester',
  },
  {
    key: 'design',
    component: DesignTab,
    icon: faBrush,
    path: `${base}design`,
    title: 'Design',
  },
  {
    key: 'settings',
    component: Settings,
    icon: faGear,
    path: `${base}settings`,
    title: 'Settings',
  },
  {
    key: 'debug',
    icon: faBug,
    component: Debug,
    path: `${base}debug`,
    title: 'Debug',
  },
  ErrorsPaneConfig,
];
