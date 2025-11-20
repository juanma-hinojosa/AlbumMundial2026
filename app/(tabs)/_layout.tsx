import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2A398D',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#e7e7e7ff',
        },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="stickerAlbum"
        options={{
          title: 'Album',
          tabBarIcon: ({ color, focused }) => (<AntDesign name="book" size={24} color={color} />)
        }}
      />
      <Tabs.Screen name="remainingStickerAlbum"
        options={{
          title: 'Figus Faltantes',
          tabBarIcon: ({ color, focused }) => (<AntDesign name="search" size={24} color={color} />)
        }}
      />
      <Tabs.Screen name="fixture"
        options={{
          title: 'Fixture',
          tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name="merge" size={24} color={color} />)
        }}
      />
      <Tabs.Screen name="stickerObtained"
        options={{
          title: 'Figus Obtenidas',
          tabBarIcon: ({ color, focused }) => (<MaterialCommunityIcons name="merge" size={24} color={color} />)
        }}
      />
    </Tabs>
  )
}
