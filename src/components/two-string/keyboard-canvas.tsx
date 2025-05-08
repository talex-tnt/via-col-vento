import React, {useMemo} from 'react';
import {shallowEqual} from 'react-redux';
import {
  calculateKeyboardFrameDimensions,
  CSSVarObject,
} from 'src/utils/keyboard-rendering';
import styled from 'styled-components';
import {
  KeyboardCanvasProps,
  KeyboardCanvasContentProps,
} from 'src/types/keyboard-rendering';
import {Case} from './case';
import {KeyGroup} from './key-group';
import {MatrixLines} from './matrix-lines';
export const KeyboardCanvas: React.FC<KeyboardCanvasProps<React.MouseEvent>> = (
  props,
) => {
  const {containerDimensions, shouldHide, ...otherProps} = props;
  const {width, height} = useMemo(
    () => calculateKeyboardFrameDimensions(otherProps.keys),
    [otherProps.keys],
  );
  const containerHeight = containerDimensions.height;
  const containerWidth = containerDimensions.width;
  const minPadding = 60;
  const keyboardWidth = ((CSSVarObject.keyWidth + CSSVarObject.keyXSpacing) * width - CSSVarObject.keyXSpacing + minPadding * 2);
  const keyboardHeight = ((CSSVarObject.keyHeight + CSSVarObject.keyYSpacing) * height - CSSVarObject.keyYSpacing + minPadding * 2);
  const widthRatio = containerWidth / keyboardWidth;
  const heightRatio = containerHeight / keyboardHeight;
  const minRatio = Math.min(widthRatio, heightRatio);
  const ratio = Math.max(1, minRatio) || 1;

  // console.log( {keyboardWidth, keyboardHeight});
  // console.log( {containerWidth, containerHeight});
  // console.log( {widthRatio, heightRatio, minRatio, ratio});

  return (
    <div
      style={{
        transform: `scale(${ratio}, ${ratio})`,
        opacity: shouldHide ? 0 : 1,
        position: 'absolute',
        pointerEvents: shouldHide ? 'none' : 'all',
      }}
    >
      <KeyboardCanvasContent {...otherProps} width={width} height={height} />
    </div>
  );
};
const KeyboardGroup = styled.div`
  position: relative;
`;

const KeyboardCanvasContent: React.FC<
  KeyboardCanvasContentProps<React.MouseEvent>
> = React.memo((props) => {
  const {
    matrixKeycodes,
    keys,
    definition,
    pressedKeys,
    mode,
    showMatrix,
    selectable,
    width,
    height,
  } = props;

  return (
    <KeyboardGroup>
      <Case width={width} height={height} />
      <KeyGroup
        {...props}
        keys={keys}
        mode={mode}
        matrixKeycodes={matrixKeycodes}
        selectable={selectable}
        definition={definition}
        pressedKeys={pressedKeys}
      />
      {showMatrix && (
        <MatrixLines
          keys={keys}
          rows={definition.matrix.rows}
          cols={definition.matrix.cols}
          width={width}
          height={height}
        />
      )}
    </KeyboardGroup>
  );
}, shallowEqual);
