import {
  FC,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal, findDOMNode } from "react-dom";
import { PlatformColor } from "react-native-platform-color";
import {
  PanResponder,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { getPortalContainer } from "./getPortalContainer";
import type { MenuComponentProps, MenuAction } from "@react-native-menu/menu";
import { ProcessedMenuAction } from "@react-native-menu/menu/lib/typescript/src/types";

const MenuView: FC<
  Omit<MenuComponentProps, "actions"> & { actions: ProcessedMenuAction[] }
> = (props) => {
  const {
    style,
    title,
    actions,
    onPressAction,
    isAnchoredToRight = false,
    children,
  } = props;
  const [visible, setVisible] = useState(false);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const { width: ww, height: wh } = useWindowDimensions();
  const isDark = useColorScheme() === "dark";

  const paning = useRef(false);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        paning.current = true;
        return true;
      },
      onPanResponderRelease: () => {
        setVisible((prev) => !prev);
      },
      onPanResponderEnd: () => {
        paning.current = false;
      },
    })
  ).current;

  const wrapChildren = useCallback((child) => {
    let inner = child;
    if (typeof inner === "string") {
      inner = <Text>{child}</Text>;
    }

    return (
      <View {...pan.panHandlers} ref={buttonRef}>
        {inner}
      </View>
    );
  }, []);

  useEffect(() => {
    const gap = 10;

    if (listRef.current && buttonRef.current && visible) {
      const buttonEl = findDOMNode(buttonRef.current) as Element;
      const listEl = findDOMNode(listRef.current) as Element;
      const rect = listEl.getBoundingClientRect();
      const buttonRect = buttonEl.getBoundingClientRect();
      /**
       * 1. align list to button's bottom left
       * 2. if list's right side outside of window, align list's right side
       *   to button's right side
       * 3. if list's bottom side is outside of window, align list's bottom
       *   side to button's top side
       * 4. list's left and top side should never outside of window
       */
      const listRect = {
        ...rect,
        width: rect.width,
        height: rect.height,
        x: Math.max(gap, buttonRect.x),
        y: Math.max(gap, buttonRect.y + buttonRect.height),
      };
      if (isAnchoredToRight || listRect.x + listRect.width > ww) {
        const x2 = Math.min(ww - gap, buttonRect.x + buttonRect.width);
        listRect.x = Math.max(gap, x2 - listRect.width);
      }
      if (listRect.y + listRect.height > wh) {
        const y2 = Math.min(wh - gap, buttonRect.y - buttonRect.height);
        listRect.y = Math.max(gap, y2 - listRect.height);
      }
      setMenuRect(listRect);
    }
  }, [isAnchoredToRight, visible, ww, wh]);

  /**
   * handle click outside
   *
   * 1. if button was clicked, close menu
   * 2. if menu was clicked, do nothing
   * 3. if neither button nor menu were clicked, close menu
   */
  const clickOutsideChecker = useCallback(
    (e) => {
      if (!visible) {
        return;
      }
      if (buttonRef.current) {
        const buttonEl = findDOMNode(buttonRef.current) as Element;
        if (buttonEl.contains(e.target)) {
          return;
        }
      }
      if (listRef.current) {
        const listEl = findDOMNode(listRef.current) as Element;
        if (listEl.contains(e.target)) {
          return;
        }
      }
      setVisible(false);
    },
    [visible]
  );

  const onPressActionInner = useCallback<
    (action: MenuAction | ProcessedMenuAction) => (e: any) => void
  >(
    (action) => {
      const { attributes = {} } = action;

      return (e: any) => {
        if (attributes.disabled) {
          return;
        }
        if (onPressAction) {
          e.nativeEvent.id = action.id;
          e.nativeEvent.event = action.id;
          setVisible(false);
          onPressAction(e);
        }
      };
    },
    [onPressAction]
  );

  useEffect(() => {
    document.addEventListener("click", clickOutsideChecker, true);
    return () => {
      document.removeEventListener("click", clickOutsideChecker, true);
    };
  }, [clickOutsideChecker]);

  const seperator = (
    <View
      style={{
        height: 1,
        opacity: 0.5,
        backgroundColor: PlatformColor("opaqueSeparator"),
      }}
    ></View>
  );

  return (
    <>
      {wrapChildren(children)}
      {createPortal(
        <View
          ref={listRef}
          style={[
            {
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: isDark
                ? "rgba(0,0,0,0.8)"
                : "rgba(255,255,255,0.8)",
              shadowOpacity: 10,
              shadowColor: `rgba(0,0,0,0.015)`,
              shadowRadius: 80,
              zIndex: 10,
              left: menuRect?.x || -1000,
              top: menuRect?.y || -1000,
              display: visible ? "flex" : "none",
              width: 200,
              position: "absolute",
            },
            {
              backdropFilter: "blur(10px)",
            } as unknown as any,
            style,
          ]}
        >
          <View>
            {title && (
              <>
                <View
                  style={{
                    paddingTop: 8,
                    paddingBottom: 6,
                    alignItems: "center",
                  }}
                >
                  <Text
                    selectable={false}
                    style={{
                      fontSize: 12,
                      color: PlatformColor("systemGray"),
                    }}
                  >
                    {title}
                  </Text>
                </View>
                {seperator}
              </>
            )}
            {actions.map((action, index) => {
              const {
                titleColor,
                image,
                imageColor,
                subtitle,
                attributes = {},
              } = action;
              let color = PlatformColor("darkText");
              if (titleColor) {
                color = titleColor as any;
              } else if (attributes.destructive) {
                color = PlatformColor("systemRed");
              } else if (attributes.disabled) {
                color = PlatformColor("systemGray3");
              }

              return (
                <Fragment key={action.id}>
                  <Pressable onPress={onPressActionInner(action)}>
                    {(state) => {
                      const hovered = (state as unknown as any).hovered;
                      const pressed = (state as unknown as any).pressed;
                      return (
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingTop: index === 0 ? 12 : 10,
                            paddingBottom:
                              index === actions.length - 1 ? 12 : 10,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            backgroundColor: hovered
                              ? PlatformColor("systemGray6")
                              : "transparent",
                            alignItems: "center",
                            opacity: pressed ? 0.2 : 1,
                          }}
                        >
                          <View>
                            <View key={action.id}>
                              <Text
                                style={[
                                  {
                                    fontWeight: "400",
                                    fontSize: 15,
                                    color,
                                  },
                                ]}
                              >
                                {action.title}
                              </Text>
                              {subtitle && (
                                <Text
                                  style={{
                                    fontSize: 13,
                                    color: PlatformColor("systemGray3"),
                                  }}
                                >
                                  {subtitle}
                                </Text>
                              )}
                            </View>
                          </View>
                          <View>
                            {image && (
                              <Text
                                style={{
                                  fontFamily: `"React Native Menu", "Material Icons", material, feather, FontAwesome, Fontisto, ionicons, material-community, foundation, FontAwesome5Free-Regular, anticon`,
                                  fontSize: 18,
                                  color: imageColor as any,
                                }}
                              >
                                {image}
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    }}
                  </Pressable>
                  {index !== actions.length - 1 && seperator}
                </Fragment>
              );
            })}
          </View>
        </View>,
        getPortalContainer()
      )}
    </>
  );
};

export default MenuView;
