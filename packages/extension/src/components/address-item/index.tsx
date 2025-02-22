import React, { FunctionComponent, useState } from "react";

import { Box } from "../box";
import { Column, Columns } from "../column";
import { Body2, H5 } from "../typography";
import { EllipsisIcon, ProfileIcon, DocumentTextIcon } from "../icon";
import { FloatingDropdown, FloatingDropdownItem } from "../dropdown";
import { ColorPalette } from "../../styles";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useIntl } from "react-intl";
import { Gutter } from "../gutter";
import { IconButton } from "../icon-button";
import { XAxis, YAxis } from "../axis";

export const AddressItem: FunctionComponent<{
  timestamp?: number;
  name?: string;
  address: string;
  memo?: string;
  isShowMemo?: boolean;
  onClick?: () => void;

  dropdownItems?: FloatingDropdownItem[];
  // true면 border를 추가함.
  highlight?: boolean;
}> = ({
  timestamp,
  name,
  address,
  memo,
  isShowMemo,
  onClick,
  dropdownItems,
  highlight,
}) => {
  const intl = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <Box
      padding="1rem"
      backgroundColor={ColorPalette["gray-600"]}
      hover={{
        backgroundColor: onClick ? ColorPalette["gray-550"] : undefined,
      }}
      borderRadius="0.375rem"
      borderWidth={highlight ? "1px" : undefined}
      borderColor={highlight ? ColorPalette["gray-400"] : undefined}
      cursor={onClick ? "pointer" : undefined}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) {
          onClick();
        }
      }}
    >
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <YAxis>
            {timestamp ? (
              <React.Fragment>
                <H5
                  style={{
                    color: ColorPalette["gray-10"],
                  }}
                >
                  {`Sent on ${intl.formatDate(new Date(timestamp), {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}`}
                </H5>
                <Gutter size="0.5rem" />
              </React.Fragment>
            ) : null}

            {name ? (
              <React.Fragment>
                <H5
                  style={{
                    color: ColorPalette["gray-10"],
                    width: "16rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {name}
                </H5>
                <Gutter size="0.5rem" />
              </React.Fragment>
            ) : null}

            <XAxis alignY="center">
              <ProfileIcon width="0.75rem" height="0.75rem" />
              <Gutter size="0.25rem" />
              <Body2
                style={{
                  color: ColorPalette["gray-200"],
                }}
              >
                {Bech32Address.shortenAddress(address, 30)}
              </Body2>
            </XAxis>

            <Gutter size="0.25rem" />
            {isShowMemo ? (
              <XAxis alignY="center">
                <DocumentTextIcon width="0.75rem" height="0.75rem" />
                <Gutter size="0.25rem" />
                {memo ? (
                  <Body2
                    style={{
                      color: ColorPalette["gray-200"],
                      width: "15rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {memo}
                  </Body2>
                ) : (
                  <Body2
                    style={{
                      color: ColorPalette["gray-300"],
                    }}
                  >
                    (Empty Memo)
                  </Body2>
                )}
              </XAxis>
            ) : null}
          </YAxis>
        </Column>

        {dropdownItems && dropdownItems.length > 0 ? (
          <FloatingDropdown
            isOpen={isMenuOpen}
            close={() => setIsMenuOpen(false)}
            items={dropdownItems}
          >
            <IconButton
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              color={ColorPalette["gray-10"]}
            >
              <EllipsisIcon width="1.5rem" height="1.5rem" />
            </IconButton>
          </FloatingDropdown>
        ) : null}
      </Columns>
    </Box>
  );
};
