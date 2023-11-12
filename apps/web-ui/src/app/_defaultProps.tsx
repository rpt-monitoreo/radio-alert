import {
  ChromeFilled,
  CrownFilled,
  SmileFilled,
  TabletFilled,
} from '@ant-design/icons';

export default {
  route: {
    path: '/',
    routes: [
      {
        path: '/welcome',
        name: 'Bienvenido',
        icon: <SmileFilled />,
        component: './Welcome',
      },
      {
        path: '/admin',
        name: 'Admin',
        icon: <CrownFilled />,
        access: 'canAdmin',
        component: './Admin',
        routes: [
          {
            path: '/admin/sub-page1',
            name: 'admin sub-page1',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg',
            component: './Welcome',
          },
        ],
      },
      {
        name: 'Lista',
        icon: <TabletFilled />,
        path: '/list',
        component: './ListTableList',
        routes: [
          {
            path: '/list/sub-page',
            name: 'list sub-page',
            icon: <CrownFilled />,
            routes: [
              {
                path: 'sub-sub-page1',
                name: 'sub-sub-page1',
                icon: <CrownFilled />,
                component: './Welcome',
              },
            ],
          },
        ],
      },
      {
        path: 'https://ant.design',
        name: 'Ant Design ',
        icon: <ChromeFilled />,
      },
    ],
  },
  location: {
    pathname: '/',
  },
};
