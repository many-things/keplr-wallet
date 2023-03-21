import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const IonDaoWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="ION DAO"
      source={{ uri: "http://192.168.10.26:3001/" }}
      originWhitelist={["http://192.168.10.26:3001/"]}
    />
  );
};
