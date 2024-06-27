import type { ProSettings } from '@ant-design/pro-components';
import { ProLayout } from '@ant-design/pro-components';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RouteCard from './RouteCardComponent';
import defaultProps from './_defaultProps';
import {
  headerTitleRender,
  menuFooterRender,
  menuItemRender,
  getActionsRender,
  getAvatarProps,
} from './appHelpers';
import PageIni from '../pages/pageIni';
import './app.module.css';
import Alerts from '../pages/alerts/Alerts';

function App() {
  const [pathname, setPathname] = useState('/admin/sub-page1');
  const base = '/radio-alert';
  const settings: Partial<ProSettings> = {
    fixSiderbar: true,
    layout: 'mix',
    splitMenus: false,
    navTheme: 'realDark', // "light",
    colorPrimary: '#1677FF',
    siderMenuType: 'sub',
    fixedHeader: false,
  };

  if (typeof document === 'undefined') {
    return <div />;
  }

  return (
    <Router>
      <ProLayout
        {...defaultProps}
        location={{
          pathname,
        }}
        token={{
          header: {
            colorBgMenuItemSelected: 'rgba(0,0,0,0.04)',
          },
        }}
        menu={{
          collapsedShowGroupTitle: true,
        }}
        avatarProps={getAvatarProps()}
        actionsRender={(props) => getActionsRender(props)}
        headerTitleRender={headerTitleRender}
        menuFooterRender={menuFooterRender}
        onMenuHeaderClick={(e) => console.log(e)}
        menuItemRender={(item, dom) => menuItemRender(item, dom, setPathname)}
        {...settings}
      >
        <Routes>
          <Route
            path={base + '/alerts'}
            element={
              <RouteCard>
                <Alerts></Alerts>
              </RouteCard>
            }
          />
          <Route
            path={base + '/admin/sub-page1'}
            element={
              <RouteCard>
                <div>AQUI DOS</div>
              </RouteCard>
            }
          />
        </Routes>
      </ProLayout>
    </Router>
  );
}

export default App;
