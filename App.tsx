import { useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { MenuView } from "./src";

export default function App() {
  useEffect(() => {
    if (Platform.OS === "web") {
      const link = document.createElement("link");
      link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);
  return (
    <View style={styles.container}>
      <Grid></Grid>

      <MenuView
        title="Menu Title"
        onPressAction={({ nativeEvent }) => {
          console.warn(JSON.stringify(nativeEvent));
        }}
        actions={[
          {
            id: "add",
            title: "Add to List",
            titleColor: "#2367A2",
            image: Platform.select({
              ios: "plus",
              android: "ic_menu_add",
              web: "face",
            }),
            imageColor: "#2367A2",
            subactions: [
              {
                id: "nested1",
                title: "Nested action",
                titleColor: "rgba(250,180,100,0.5)",
                subtitle: "State is mixed",
                image: Platform.select({
                  ios: "heart.fill",
                  android: "ic_menu_today",
                  web: "e88e",
                }),
                imageColor: "rgba(100,200,250,0.3)",
                state: "mixed",
              },
              {
                id: "nestedDestructive",
                title: "Destructive Action",
                attributes: {
                  destructive: true,
                },
                image: Platform.select({
                  ios: "trash",
                  android: "ic_menu_delete",
                  web: "delete",
                }),
              },
            ],
          },
          {
            id: "share",
            title: "Share Action",
            titleColor: "#46F289",
            subtitle: "Share action on SNS",
            image: Platform.select({
              ios: "square.and.arrow.up",
              android: "ic_menu_share",
              web: "share",
            }),
            imageColor: "#46F289",
            state: "on",
          },
          {
            id: "mixed",
            title: "Mixed State",
            titleColor: "rgba(100,200,250,0.3)",
            subtitle: "State is mixed",
            image: Platform.select({
              ios: "heart.fill",
              android: "ic_menu_today",
              web: "calendar_today",
            }),
            imageColor: "rgba(100,200,250,0.3)",
            state: "mixed",
            subactions: [
              {
                id: "nested2",
                title: "Nested action",
                titleColor: "rgba(250,180,100,0.5)",
                subtitle: "State is mixed",
                image: Platform.select({
                  ios: "tray",
                  android: "ic_menu_agenda",
                  web: "e88e",
                }),
                imageColor: "rgba(100,200,250,0.3)",
                state: "mixed",
              },
              {
                id: "nestedMixed",
                title: "Mixed State",
                subtitle: "State is mixed",
                image: Platform.select({
                  ios: "heart.fill",
                  android: "ic_menu_today",
                }),
                imageColor: "#46F289",
                subactions: [
                  {
                    id: "nestednesteddisabled",
                    title: "Disabled Action",
                    subtitle: "Action is disabled",
                    attributes: {
                      disabled: true,
                    },
                    image: Platform.select({
                      ios: "tray",
                      android: "ic_menu_agenda",
                      web: "e88e",
                    }),
                  },
                  {
                    id: "nestednestedhidden",
                    title: "Hidden Action",
                    subtitle: "Action is hidden",
                    attributes: {
                      hidden: true,
                    },
                  },
                  {
                    id: "nestednesteddestructive",
                    title: "Destructive Action",
                    attributes: {
                      destructive: true,
                    },
                    image: Platform.select({
                      ios: "trash",
                      android: "ic_menu_delete",
                      web: "face",
                    }),
                  },
                ],
              },
            ],
          },
          {
            id: "disabled",
            title: "Disabled Action",
            subtitle: "Action is disabled",
            attributes: {
              disabled: true,
            },
            image: Platform.select({
              ios: "tray",
              android: "ic_menu_agenda",
              web: "favorite",
            }),
          },
          {
            id: "hidden",
            title: "Hidden Action",
            subtitle: "Action is hidden",
            attributes: {
              hidden: true,
            },
          },
          {
            id: "destructive",
            title: "Destructive Action",
            attributes: {
              destructive: true,
            },
            image: Platform.select({
              ios: "trash",
              android: "ic_menu_delete",
              web: "delete",
            }),
          },
        ]}
        shouldOpenOnLongPress={true}
      >
        <Pressable style={styles.button}>
          {({ hovered }: any) => {
            return (
              <Text
                style={[styles.buttonText, hovered && styles.buttonTextHovered]}
              >
                Test
              </Text>
            );
          }}
        </Pressable>
      </MenuView>
    </View>
  );
}

function Grid() {
  const { width, height } = useWindowDimensions();
  const gap = 100;
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
      }}
    >
      {Array.from({ length: Math.ceil(width / gap) }, (v, k) => {
        return (
          <View
            key={k}
            style={{
              width: 3,
              height,
              backgroundColor: "red",
              position: "absolute",
              left: k * gap,
            }}
          ></View>
        );
      })}
      {Array.from({ length: Math.ceil(height / gap) }, (v, k) => {
        return (
          <View
            key={k}
            style={{
              height: 3,
              width,
              backgroundColor: "blue",
              position: "absolute",
              top: k * gap,
            }}
          ></View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: 100,
    width: 100,
    backgroundColor: "red",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "white" },
  buttonTextHovered: { color: "black" },
});
