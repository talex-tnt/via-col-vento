import { useMemo, useState, useEffect, useRef } from 'react';
import {UnconnectedGlobalMenu} from './components/menus/global';
import {Route, Router} from 'wouter';
import PANES from './utils/pane-config';
import {Home} from './components/Home';
import {createGlobalStyle} from 'styled-components';
import {CanvasRouter as CanvasRouter3D} from './components/three-fiber/canvas-router';
import {CanvasRouter as CanvasRouter2D} from './components/two-string/canvas-router';
import {TestContext} from './components/panes/test';
import {OVERRIDE_HID_CHECK} from './utils/override';
import {useAppSelector} from './store/hooks';
import {getRenderMode} from './store/settingsSlice';
import {useCanvasConfig} from 'src/utils/canvas';

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  getPanelElement,
  getPanelGroupElement,
  getResizeHandleElement,
} from "react-resizable-panels";

const GlobalStyle = createGlobalStyle`
  *:focus {
    outline: none;
  }
`;

export default () => {
  const hasHIDSupport = 'hid' in navigator || OVERRIDE_HID_CHECK;
  const {hideCanvasScene, hideConfigureScene} = useCanvasConfig();
  const refs = useRef<{
    topPanelElement: HTMLElement | null;
    bottomPanelElement: HTMLElement | null;
    resizeHandleElement: HTMLElement | null;
  } | undefined>();

  useEffect(() => {
    const topPanelElement = getPanelElement("top-panel");
    const bottomPanelElement = getPanelElement("bottom-panel");
    const resizeHandleElement = getResizeHandleElement("resize-handle");
    refs.current = {
      topPanelElement,
      bottomPanelElement,
      resizeHandleElement,
    };
  }, []);

  const canvasRouterHeight = hideConfigureScene ? "50%" : "100%";

  const renderMode = useAppSelector(getRenderMode);
  const RouteComponents = useMemo(
    () =>
      PANES.map((pane) => {
        return (
          <Route component={pane.component} key={pane.key} path={pane.path} />
        );
      }),
    [],
  );
  const is2DRendering = renderMode === '2D';
  const CanvasRouter = is2DRendering ? CanvasRouter2D : CanvasRouter3D;
  const testContextState = useState({clearTestKeys: () => {}});

  useEffect(() => {
    if(refs.current) {
      const {topPanelElement, bottomPanelElement, resizeHandleElement} = refs.current;
      if(topPanelElement && bottomPanelElement && resizeHandleElement) {
        if(hideConfigureScene) {
          topPanelElement.style.display = is2DRendering ? "none": "block";
          bottomPanelElement.style.display = !is2DRendering ? "none": "block";
          resizeHandleElement.style.display = "none";
        } else {
          topPanelElement.style.display = hideCanvasScene ? "none" : "block";
          bottomPanelElement.style.display = "block";
          resizeHandleElement.style.display = hideCanvasScene ? "none" : "block";
        }
      }
  }
}, [hideCanvasScene, hideConfigureScene]);
  const base = import.meta.env.BASE_URL;
  return (
    <>
        <TestContext.Provider value={testContextState}>
            <GlobalStyle />
            <Router base={base !== '/' ? base : undefined} >
              {hasHIDSupport && <UnconnectedGlobalMenu />}

              <PanelGroup direction="vertical">
                <Panel id="top-panel">
                  <CanvasRouter height={canvasRouterHeight} />
                </Panel>
                <PanelResizeHandle  id="resize-handle"/>
                <Panel id="bottom-panel">
                  <Home hasHIDSupport={hasHIDSupport}>{RouteComponents}</Home>
                </Panel>
              </PanelGroup>

            </Router>
        </TestContext.Provider>
    </>
  );
};
