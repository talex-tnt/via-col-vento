import {FC, useState, useEffect, useMemo, Key} from 'react';
import styled from 'styled-components';
import {Button} from '../../inputs/button';
import {KeycodeModal} from '../../inputs/custom-keycode-modal';
import {title, component} from '../../icons/keyboard';
import {MessageDialog} from '../../inputs/message-dialog';
import TextInput from '../../inputs/text-input';
import {
  TooltipContainer,
} from 'src/components/two-string/unit-key/keycap-base';
import {Keycap2DTooltip} from '../../inputs/tooltip';

import {
  faTrash,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  IconButtonUnfilledContainer,
} from 'src/components/inputs/icon-button';

import * as EncoderPane from './encoder';
import {
  keycodeInMaster,
  getByteForCode,
  getKeycodes,
  getOtherMenu,
  IKeycode,
  IKeycodeMenu,
  categoriesForKeycodeModule,
} from '../../../utils/key';
import {ErrorMessage} from '../../styled';
import {
  KeycodeType,
  getLightingDefinition,
  isVIADefinitionV3,
  isVIADefinitionV2,
  VIADefinitionV3,
} from '@the-via/reader';
import {OverflowCell, SubmenuOverflowCell, SubmenuRow} from '../grid';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  getBasicKeyToByte,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  getSelectedKey,
  getSelectedKeymap,
  updateKey as updateKeyAction,
  updateSelectedKey,
} from 'src/store/keymapSlice';
import {
  getMacroCount,
} from 'src/store/macrosSlice';
import {
  disableGlobalHotKeys,
  enableGlobalHotKeys,
  getDisableFastRemap,
} from 'src/store/settingsSlice';
import {getNextKey} from 'src/utils/keyboard-rendering';
import { update } from 'idb-keyval';
const KeycodeList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 64px);
  grid-auto-rows: 64px;
  justify-content: center;
  grid-gap: 10px;
`;

const MenuContainer = styled.div`
  padding: 15px 20px 20px 10px;
`;

const Keycode = styled(Button)<{disabled: boolean}>`
  width: 50px;
  height: 50px;
  line-height: 18px;
  border-radius: 64px;
  font-size: 14px;
  border: 4px solid var(--border_color_icon);
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  margin: 0;
  box-shadow: none;
  position: relative;
  border-radius: 10px;
  ${(props: any) => props.disabled && `
    cursor:not-allowed;
    background: var(--bg_menu);
    border: 4px solid var(--bg_control);
    transform: none;
  `}
  ${(props: any) => !props.disabled && `&:hover {
    border-color: var(--color_accent);
    transform: translate3d(0, -2px, 0);
    }`}
  ${(props: any) => props.disabled && `&:hover {
    transform: none;
    }`}

  &:hover {
    overflow: visible;
  }
`;

const KeycodeContent = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
`;

const CustomKeycode = styled(Button)`
  width: 50px;
  height: 50px;
  line-height: 18px;
  border-radius: 10px;
  font-size: 14px;
  border: 4px solid var(--border_color_icon);
  background: var(--color_accent);
  border-color: var(--color_inside_accent);
  color: var(--color_inside_accent);
  margin: 0;
`;

const KeycodeContainer = styled.div`
  padding: 12px;
  padding-bottom: 30px;
`;

const KeycodeDesc = styled.div`
  position: fixed;
  bottom: 0;
  background: var(--bg_menu);
  color: var(--color_label);
  box-sizing: border-box;
  transition: opacity 0.4s ease-out;
  height: 25px;
  width: 100%;
  line-height: 14px;
  padding: 5px;
  font-size: 14px;
  font-weight: bold;
  opacity: 1;
  pointer-events: none;
  &:empty {
    opacity: 0;
  }
`;

function keyCodeToObject (acc: Record<string, IKeycode>, keycode: IKeycode): Record<string, IKeycode> {
  return {...acc, [keycode.code]: keycode};
};

const generateKeycodeCategories = (basicKeyToByte: Record<string, number>, numMacros: number = 16) =>
  getKeycodes(numMacros).concat(getOtherMenu(basicKeyToByte));

const maybeFilter = <M extends Function>(maybe: boolean, filter: M) =>
  maybe ? () => true : filter;

export const Pane: FC = () => {
  const selectedKey = useAppSelector(getSelectedKey);
  const dispatch = useAppDispatch();
  const keys = useAppSelector(getSelectedKeyDefinitions);
  useEffect(
    () => () => {
      dispatch(updateSelectedKey(null));
    },
    [],
  ); // componentWillUnmount equiv

  if (selectedKey !== null && keys[selectedKey].ei !== undefined) {
    return <EncoderPane.Pane />;
  }
  return <KeycodePane />;
};

const allKeycodesId = 'all_keycodes';

export const KeycodePane: FC = () => {
  const dispatch = useAppDispatch();
  const macros = useAppSelector((state: any) => state.macros);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const matrixKeycodes = useAppSelector(getSelectedKeymap);
  const selectedKey = useAppSelector(getSelectedKey);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const selectedKeyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const {basicKeyToByte} = useAppSelector(getBasicKeyToByte);
  const macroCount = useAppSelector(getMacroCount);

  const KeycodeCategories = useMemo(
    () => generateKeycodeCategories(basicKeyToByte, macroCount),
    [basicKeyToByte, macroCount],
  );

  // TODO: improve typing so we can get rid of this
  if (!selectedDefinition || !selectedDevice || !matrixKeycodes) {
    return null;
  }

  const [selectedCategory, setSelectedCategory] = useState(allKeycodesId);
  const [mouseOverDesc, setMouseOverDesc] = useState<string | null>(null);
  const [showKeyTextInputModal, setShowKeyTextInputModal] = useState(false);
  const [keycapsFilter, setKeycapsFilter] = useState('');
  const [codePendingForConfirmation, setCodePendingForConfirmation] = useState<number | null>(null);

  const getEnabledMenus = (): IKeycodeMenu[] => {
    if (isVIADefinitionV3(selectedDefinition)) {
      return getEnabledMenusV3(selectedDefinition);
    }
    const {lighting, customKeycodes} = selectedDefinition;
    const {keycodes} = getLightingDefinition(lighting);
    return KeycodeCategories.filter(
      maybeFilter(
        keycodes === KeycodeType.QMK,
        ({id}) => id !== 'qmk_lighting',
      ),
    )
      .filter(
        maybeFilter(keycodes === KeycodeType.WT, ({id}) => id !== 'lighting'),
      )
      .filter(
        maybeFilter(
          typeof customKeycodes !== 'undefined',
          ({id}) => id !== 'custom',
        ),
      );
  };
  const getEnabledMenusV3 = (definition: VIADefinitionV3): IKeycodeMenu[] => {
    const keycodes = ['default' as const, ...(definition.keycodes || [])];
    const allowedKeycodes = keycodes.flatMap((keycodeName) =>
      categoriesForKeycodeModule(keycodeName),
    );
    if ((selectedDefinition.customKeycodes || []).length !== 0) {
      allowedKeycodes.push('custom');
    }
    return KeycodeCategories.filter((category) =>
      allowedKeycodes.includes(category.id),
    );
  };

  const renderMacroError = () => {
    return (
      <ErrorMessage>
        Your current firmware does not support macros. Install the latest
        firmware for your device.
      </ErrorMessage>
    );
  };

  const renderCategories = () => {
    return (
      <MenuContainer>
        {getEnabledMenus().map(({id, label}) => (
          <SubmenuRow
            $selected={id === selectedCategory}
            onClick={() => setSelectedCategory(selectedCategory === id ? allKeycodesId : id)}
            key={id}
          >
            {label}
          </SubmenuRow>
        ))}
      </MenuContainer>
    );
  };

  const renderKeyInputModal = () => {
    dispatch(disableGlobalHotKeys());

    return (
      <KeycodeModal
        defaultValue={
          selectedKey !== null ? matrixKeycodes[selectedKey] : undefined
        }
        onExit={() => {
          dispatch(enableGlobalHotKeys());
          setShowKeyTextInputModal(false);
        }}
        onConfirm={(keycode) => {
          dispatch(enableGlobalHotKeys());
          updateKey(keycode);
          setShowKeyTextInputModal(false);
        }}
      />
    );
  };

  const updateKey = (value: number) => {
    if (selectedKey !== null) {
      dispatch(updateKeyAction(selectedKey, value));
      dispatch(
        updateSelectedKey(
          disableFastRemap || !selectedKeyDefinitions
            ? null
            : getNextKey(selectedKey, selectedKeyDefinitions),
        ),
      );
    }
  };

  const handleClick = (code: string, i: number) => {
    if (code == 'text') {
      setShowKeyTextInputModal(true);
    } else {
        if(keycodeInMaster(code, basicKeyToByte)) {
          const c = getByteForCode(code, basicKeyToByte);
          if(disableFastRemap) {
            setCodePendingForConfirmation(c);
          } else {
            updateKey(c);
          }
        }
      }
  };

  const renderKeycode = (keycode: IKeycode, index: number, selected: boolean) => {
    const {code, title, name} = keycode;
    return (
      <Keycode
        key={code}
        disabled={!selected || !keycodeInMaster(code, basicKeyToByte) && code != 'text'}
        onClick={() => {if(selected) {handleClick(code, index)}}}
        onMouseOver={() => setMouseOverDesc(title ? `${code}: ${title}` : code)}
        onMouseOut={() => setMouseOverDesc(null)}
      >
        <KeycodeContent>{name}</KeycodeContent>
        <TooltipContainer $rotate={0}>
          <Keycap2DTooltip>
            {title ? `${code}: ${title}` : `${code}`}
          </Keycap2DTooltip>
        </TooltipContainer>
      </Keycode>
    );
  };

  const renderCustomKeycode = () => {
    return (
      <CustomKeycode
        key="customKeycode"
        onClick={() => selectedKey !== null && handleClick('text', 0)}
        onMouseOver={() => setMouseOverDesc('Enter any QMK Keycode')}
        onMouseOut={() => setMouseOverDesc(null)}
      >
        Any
      </CustomKeycode>
    );
  };

  const renderSelectedCategory = (
    keycodes: IKeycode[],
    selectedCategory: string,
    selectedKeycode: number | null = null,
  ) => {

    const keycodeListItems = keycodes.map((keycode, i) =>
      renderKeycode(keycode, i, !!selectedKeycode),
    );
    switch (selectedCategory) {
      case 'macro': {
        return !macros.isFeatureSupported ? (
          renderMacroError()
        ) : (
          <KeycodeList>{keycodeListItems}</KeycodeList>
        );
      }
      case 'special': {
        return (
          <KeycodeList>
            {[renderCustomKeycode()].concat(keycodeListItems)}
          </KeycodeList>
        );
      }
      case 'shifted': {
        return (
          <KeycodeList>
            {keycodeListItems}
          </KeycodeList>
        );
      }
      case 'custom': {
        if (
          (!isVIADefinitionV2(selectedDefinition) &&
            !isVIADefinitionV3(selectedDefinition)) ||
          !selectedDefinition.customKeycodes
        ) {
          return null;
        }
        return (
          <KeycodeList>
            {selectedDefinition.customKeycodes.map((keycode, idx) => {
              return renderKeycode(
                {
                  ...keycode,
                  code: `CUSTOM(${idx})`,
                },
                idx,
                !!selectedKeycode
              );
            })}
          </KeycodeList>
        );
      }
      default: {
        return <KeycodeList>{keycodeListItems}</KeycodeList>;
      }
    }
  };

  const selectedCategoryKeycodes = useMemo(() => {
    const allKeycodesList = KeycodeCategories.reduce<IKeycode[]>((acc, {keycodes}) => [...acc, ...keycodes], []);
    const allUniqueKeycodes = Object.values(allKeycodesList.reduce(keyCodeToObject, {})) as IKeycode[];
    const selectedKeycodes = KeycodeCategories.find(({id}) => id === selectedCategory,)?.keycodes as IKeycode[]
    return selectedCategory === allKeycodesId ? allUniqueKeycodes: selectedKeycodes;
  }, [KeycodeCategories, selectedCategory]);

  const onConfirm = () => {
    if(typeof codePendingForConfirmation === 'number'){
      updateKey(codePendingForConfirmation as number);
    }
    setCodePendingForConfirmation(null);
  };
  const onCancel = () => { setCodePendingForConfirmation(null); };
  const placeholder = `Search among ${selectedCategoryKeycodes.length} keycodes`;
  const keycapsFilterMargin = '10px 10px 10px 30px';
  const filteredKeycodes = selectedCategoryKeycodes.filter((keycode) => {
    const {name, code, title} = keycode;
    return (
      name?.toLowerCase().includes(keycapsFilter.toLowerCase()) ||
      code?.toLowerCase().includes(keycapsFilter.toLowerCase()) ||
      title?.toLowerCase().includes(keycapsFilter.toLowerCase())
    );
  }
  );
  return (
    <>
     <MessageDialog isOpen={codePendingForConfirmation !== null} onConfirm={onConfirm} onCancel={onCancel}>
        Save on the keyboard?
      </MessageDialog>
      <SubmenuOverflowCell>{renderCategories()}</SubmenuOverflowCell>
      <OverflowCell>
        <TextInput $width='50%' $margin={keycapsFilterMargin} type="text" placeholder={placeholder} onChange={(e) => setKeycapsFilter(e.target.value)} value={keycapsFilter} />
        <IconButtonUnfilledContainer
            onClick={() => {
              setKeycapsFilter('');
            }}
            disabled={keycapsFilter.length === 0}
            style={{borderRight: '1px solid var(--color_accent)'}}
          >
            <FontAwesomeIcon
              size={'sm'}
              color={'var(--color_accent)'}
              icon={faXmark}
            />
          </IconButtonUnfilledContainer>
        <KeycodeContainer>
          {renderSelectedCategory(filteredKeycodes, selectedCategory, selectedKey)}
        </KeycodeContainer>
        <KeycodeDesc>{mouseOverDesc}</KeycodeDesc>
        {showKeyTextInputModal && renderKeyInputModal()}
      </OverflowCell>
    </>
  );
};

export const Icon = component;
export const Title = title;
