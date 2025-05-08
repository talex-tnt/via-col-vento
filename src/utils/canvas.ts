

import {useProgress} from '@react-three/drei';
import {DefinitionVersionMap} from '@the-via/reader';
import {
  getCustomDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import {getLoadProgress} from 'src/store/keymapSlice';
import {getDesignDefinitionVersion} from 'src/store/settingsSlice';
import {OVERRIDE_HID_CHECK} from 'src/utils/override';
import {useLocation} from 'wouter';
import {useMemo} from 'react';

export const useCanvasConfig = () => {
	const [path] = useLocation();
	const loadProgress = useAppSelector(getLoadProgress);
	const {progress} = useProgress();
	const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
	const selectedDefinition = useAppSelector(getSelectedDefinition);
	const definitionVersion = useAppSelector(getDesignDefinitionVersion);
	const versionDefinitions: DefinitionVersionMap[] = useMemo(
		() =>
		localDefinitions.filter(
			(definitionMap) => definitionMap[definitionVersion],
		),
		[localDefinitions, definitionVersion],
	);
	const hideDesignScene = '/design' === path && !versionDefinitions.length;
	const hideConfigureScene =
		'/' === path &&
		(!selectedDefinition || (loadProgress + progress / 100) / 2 !== 1);
	const showAuthorizeButton = 'hid' in navigator || OVERRIDE_HID_CHECK;
	const hideCanvasScene =
		!showAuthorizeButton ||
		['/settings', '/errors', '/debug'].includes(path) ||
		hideDesignScene ||
		hideConfigureScene;

		console.log({hideCanvasScene, showAuthorizeButton, path, hideDesignScene, hideConfigureScene, selectedDefinition, loadProgress, progress});

	return { hideCanvasScene, showAuthorizeButton, path, selectedDefinition };
}


export function fitTextToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, initialFontSize = 32, minFontSize = 8, fontFamily = 'Arial', bold = true) {
	let fontSize = initialFontSize;
	let lastWidth = Infinity;

	for (let i = 0; i < 10; i++) { // Limit iterations to avoid infinite loop
		ctx.font = `${bold ? 'bold ': ''}${fontSize}px ${fontFamily}`;
		const metrics = ctx.measureText(text);
		const width = metrics.width;
		if (width <= maxWidth || width === lastWidth) {
			break;
		}
		const ratio = maxWidth / width;
		fontSize = Math.max(Math.floor(fontSize * ratio), minFontSize);
		lastWidth = width;
	}
	return fontSize;
}