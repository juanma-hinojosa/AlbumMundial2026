import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="stickerAlbum" options={{ title: 'Sticker Album' }} />
      <Tabs.Screen name="stickerObtained" options={{ title: 'Sticker Obtained' }} />
      <Tabs.Screen name="remainingStickerAlbum" options={{ title: 'Remaining Sticker Album' }} />
    </Tabs>
  )
}
