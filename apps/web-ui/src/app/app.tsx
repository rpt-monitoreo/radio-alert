import {
  GithubFilled,
  InfoCircleFilled,
  LogoutOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import type { ProSettings } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProLayout } from '@ant-design/pro-components';
import { Button, Dropdown } from 'antd';
import { useState } from 'react';
import defaultProps from './_defaultProps';
import SearchInput from '../components/SearchInput';
import MenuCard from '../components/MenuCard';
import PageIni from '../pages/pageIni';
import './app.module.css';

function App() {
  const settings: Partial<ProSettings> = {
    fixSiderbar: true,
    layout: 'mix',
    splitMenus: false,
    navTheme: 'realDark', // "light",
    colorPrimary: '#1677FF',
    siderMenuType: 'sub',
    fixedHeader: false,
  };

  const [pathname, setPathname] = useState('/Welcome');
  const [num, setNum] = useState(40);

  if (typeof document === 'undefined') {
    return <div />;
  }
  return (
    <ProLayout
      prefixCls="my-prefix"
      bgLayoutImgList={[
        {
          src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
          left: 85,
          bottom: 100,
          height: '303px',
        },
        {
          src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
          bottom: -68,
          right: -45,
          height: '303px',
        },
        {
          src: 'https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png',
          bottom: 0,
          left: 0,
          width: '331px',
        },
      ]}
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
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        size: 'small',
        title: 'Qinini',
        render: (_props, dom) => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Salir',
                  },
                ],
              }}
            >
              {dom}
            </Dropdown>
          );
        },
      }}
      actionsRender={(props) => {
        if (props.isMobile) return [];
        if (typeof window === 'undefined') return [];
        return [
          props.layout !== 'side' && document.body.clientWidth > 1400 ? (
            <SearchInput />
          ) : undefined,
          <InfoCircleFilled key="InfoCircleFilled" />,
          <QuestionCircleFilled key="QuestionCircleFilled" />,
          <GithubFilled key="GithubFilled" />,
        ];
      }}
      headerTitleRender={(logo, title, _) => {
        const defaultDom = (
          <a>
            {logo}
            {title}
          </a>
        );
        if (typeof window === 'undefined') return defaultDom;
        if (document.body.clientWidth < 1400) {
          return defaultDom;
        }
        if (_.isMobile) return defaultDom;
        return (
          <>
            {defaultDom}
            <MenuCard />
          </>
        );
      }}
      menuFooterRender={(props) => {
        if (props?.collapsed) return undefined;
        return (
          <div
            style={{
              textAlign: 'center',
              paddingBlockStart: 12,
            }}
          >
            <div>© 2021 Made with love</div>
            <div>by Ant Design</div>
          </div>
        );
      }}
      onMenuHeaderClick={(e) => console.log(e)}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            setPathname(item.path || '/welcome');
          }}
        >
          {dom}
        </div>
      )}
      {...settings}
    >
      <PageContainer
        token={{
          paddingInlinePageContainerContent: num,
        }}
        extra={[
          <Button key="3">funcionar</Button>,
          <Button key="2">funcionar</Button>,
          <Button
            key="1"
            type="primary"
            onClick={() => {
              setNum(num > 0 ? 0 : 40);
            }}
          >
            operación principal
          </Button>,
        ]}
        subTitle="descripción sencilla"
        footer={[
          <Button key="3">reiniciar</Button>,
          <Button key="2" type="primary">
            entregar
          </Button>,
        ]}
      >
        <ProCard
          style={{
            height: '200vh',
            minHeight: 800,
          }}
          gutter={{ xs: 8, sm: 16, md: 0 }}
        >
          <PageIni></PageIni>
        </ProCard>
      </PageContainer>
    </ProLayout>
  );
}

export default App;
