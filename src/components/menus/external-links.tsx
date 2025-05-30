import {faDiscord, faGithub} from '@fortawesome/free-brands-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import {VIALogo} from '../icons/via';
import {CategoryMenuTooltip} from '../inputs/tooltip';
import {CategoryIconContainer} from '../panes/grid';

const ExternalLinkContainer = styled.span`
  position: absolute;
  right: 1em;
  display: flex;
  gap: 1em;
  color: var(--color_label);
  align-items: center;
`;

export const ExternalLinks = () => (
  <ExternalLinkContainer>
    <span>
      This app is a fork of
    </span>
    <a href="https://caniusevia.com/" target="_blank">
      <CategoryIconContainer>
        <VIALogo height="25px" fill="currentColor" />
        <CategoryMenuTooltip>Firmware + Docs</CategoryMenuTooltip>
      </CategoryIconContainer>
    </a>
    <a href="https://discord.gg/NStTR5YaPB" target="_blank">
      <CategoryIconContainer>
        <FontAwesomeIcon size={'xl'} icon={faDiscord} />
        <CategoryMenuTooltip>Discord</CategoryMenuTooltip>
      </CategoryIconContainer>
    </a>
    <a href="https://github.com/talex-tnt/via-col-vento" target="_blank">
      <CategoryIconContainer>
        <FontAwesomeIcon size={'xl'} icon={faGithub} />
        <CategoryMenuTooltip>Github</CategoryMenuTooltip>
      </CategoryIconContainer>
    </a>
  </ExternalLinkContainer>
);
