import React, { FunctionComponent, useEffect, useState } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { BaseTypography, Subtitle1, Subtitle3 } from "../typography";
import { Gutter } from "../gutter";
import { HorizontalRadioGroup } from "../radio-group";
import { YAxis } from "../axis";
import { Stack } from "../stack";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Key } from "@keplr-wallet/types";
import { IMemoConfig, IRecipientConfig } from "@keplr-wallet/hooks";
import { Bleed } from "../bleed";
import { RecentSendHistory } from "@keplr-wallet/background";
import { AddressItem } from "../address-item";
import SimpleBar from "simplebar-react";
import styled from "styled-components";

type Type = "recent" | "contacts" | "accounts";

const AltTypography = styled(BaseTypography)`
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.25;

  margin-left: 0.25rem;
`;

export const AddressBookModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  historyType: string;
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;

  permitSelfKeyInfo?: boolean;
}> = observer(
  ({
    isOpen,
    close,
    historyType,
    recipientConfig,
    memoConfig,
    permitSelfKeyInfo,
  }) => {
    const { analyticsStore, uiConfigStore, keyRingStore } = useStore();

    const [type, setType] = useState<Type>("recent");

    const [recents, setRecents] = useState<RecentSendHistory[]>([]);
    const [accounts, setAccounts] = useState<
      (Key & {
        vaultId: string;
      })[]
    >([]);

    useEffect(() => {
      uiConfigStore.addressBookConfig
        .getRecentSendHistory(recipientConfig.chainId, historyType)
        .then((res) => {
          setRecents(res);
        });
    }, [historyType, recipientConfig.chainId, uiConfigStore.addressBookConfig]);

    useEffect(() => {
      uiConfigStore.addressBookConfig
        .getVaultCosmosKeysSettled(
          recipientConfig.chainId,
          permitSelfKeyInfo ? undefined : keyRingStore.selectedKeyInfo?.id
        )
        .then((keys) => {
          setAccounts(
            keys
              .filter((res) => {
                return res.status === "fulfilled";
              })
              .map((res) => {
                if (res.status === "fulfilled") {
                  return res.value;
                }
                throw new Error("Unexpected status");
              })
          );
        });
    }, [
      keyRingStore.selectedKeyInfo?.id,
      permitSelfKeyInfo,
      recipientConfig.chainId,
      uiConfigStore.addressBookConfig,
    ]);

    const datas: {
      timestamp?: number;
      name?: string;
      address: string;
      memo?: string;

      isSelf?: boolean;
    }[] = (() => {
      switch (type) {
        case "recent": {
          return recents.map((recent) => {
            return {
              timestamp: recent.timestamp,
              address: recent.recipient,
              memo: recent.memo,
            };
          });
        }
        case "contacts": {
          return uiConfigStore.addressBookConfig
            .getAddressBook(recipientConfig.chainId)
            .map((addressData) => {
              return {
                name: addressData.name,
                address: addressData.address,
                memo: addressData.memo,
              };
            });
        }
        case "accounts": {
          return accounts.map((account) => {
            const isSelf = keyRingStore.selectedKeyInfo?.id === account.vaultId;

            return {
              name: account.name,
              address: account.bech32Address,

              isSelf,
            };
          });
        }
        default: {
          return [];
        }
      }
    })();

    return (
      <Modal isOpen={isOpen} close={close} align="bottom">
        <Box
          backgroundColor={ColorPalette["gray-600"]}
          paddingX="0.75rem"
          paddingTop="1rem"
        >
          <Box paddingX="0.5rem" paddingY="0.375rem">
            <Subtitle1
              style={{
                color: ColorPalette["white"],
              }}
            >
              Address Book
            </Subtitle1>
          </Box>

          <Gutter size="0.75rem" />

          <YAxis alignX="left">
            <HorizontalRadioGroup
              items={[
                {
                  key: "recent",
                  text: "Recent",
                },
                {
                  key: "contacts",
                  text: "Contacts",
                },
                {
                  key: "accounts",
                  text: "My account",
                },
              ]}
              selectedKey={type}
              onSelect={(key) => {
                analyticsStore.logEvent("click_addressBook_tab", {
                  tabName: key,
                });
                setType(key as Type);
              }}
            />
          </YAxis>

          <Gutter size="0.75rem" />

          {datas.length > 0 ? (
            <SimpleBar
              style={{
                maxHeight: "23.625rem",
                minHeight: "14.875rem",
                overflowY: "auto",
              }}
            >
              <Stack gutter="0.75rem">
                {(() => {
                  if (type !== "accounts" || !permitSelfKeyInfo) {
                    return datas.map((data, i) => {
                      return (
                        <AddressItem
                          key={i}
                          timestamp={data.timestamp}
                          name={data.name}
                          address={data.address}
                          memo={data.memo}
                          isShowMemo={type !== "accounts"}
                          onClick={() => {
                            recipientConfig.setValue(data.address);
                            memoConfig.setValue(data.memo ?? "");
                            close();
                          }}
                        />
                      );
                    });
                  }

                  const selfAccount = datas.find((data) => data.isSelf);
                  const otherAccounts = datas.filter((data) => !data.isSelf);

                  return (
                    <React.Fragment>
                      {selfAccount ? (
                        <React.Fragment>
                          <AltTypography>Current Wallet</AltTypography>
                          <AddressItem
                            name={selfAccount.name}
                            address={selfAccount.address}
                            isShowMemo={false}
                            onClick={() => {
                              recipientConfig.setValue(selfAccount.address);
                              close();
                            }}
                            highlight={true}
                          />
                          <Gutter size="1.375rem" />
                        </React.Fragment>
                      ) : null}

                      <AltTypography>Other Wallets</AltTypography>
                      {otherAccounts.map((data, i) => {
                        return (
                          <AddressItem
                            key={i}
                            name={data.name}
                            address={data.address}
                            isShowMemo={false}
                            onClick={() => {
                              recipientConfig.setValue(data.address);
                              close();
                            }}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                })()}
                <Gutter size="0.75rem" />
              </Stack>
            </SimpleBar>
          ) : (
            <Box
              alignX="center"
              alignY="center"
              style={{
                height: "14.875rem",
                color: ColorPalette["gray-400"],
              }}
            >
              <Bleed top="3rem">
                <YAxis alignX="center">
                  <EmptyIcon size="4.5rem" />
                  <Gutter size="1.25rem" />
                  <Subtitle3>
                    {(() => {
                      switch (type) {
                        case "accounts":
                          return "No other wallet found";
                        default:
                          return "No Data Yet";
                      }
                    })()}
                  </Subtitle3>
                </YAxis>
              </Bleed>
            </Box>
          )}
        </Box>
      </Modal>
    );
  }
);
const EmptyIcon: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 72 72"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7.5"
        d="M45.5 40.5h-18m12.182-21.568l-6.364-6.364a4.5 4.5 0 00-3.182-1.318H14A6.75 6.75 0 007.25 18v36A6.75 6.75 0 0014 60.75h45A6.75 6.75 0 0065.75 54V27A6.75 6.75 0 0059 20.25H42.864a4.5 4.5 0 01-3.182-1.318z"
      />
    </svg>
  );
};
