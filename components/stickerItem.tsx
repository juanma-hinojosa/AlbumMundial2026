import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const StickerItem = ({ item, quantity = 0, onToggle, onDecrement }) => {
  const isOwned = quantity > 0;
  const isRepeated = quantity > 1;

  return (
    <TouchableOpacity
      onPress={onToggle}
      onLongPress={onDecrement}
      delayLongPress={500}
      style={[styles.container, isOwned ? styles.owned : styles.missing]}
    >
      <Text >{item.number}</Text>
      {/* <Text>{item.id}</Text> */}

      {isRepeated && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{quantity}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%', 
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1, 
    borderRadius: 50,
  },
  missing: {
    backgroundColor: '#f0f0f0', // Gris
    opacity: 0.5,
  },
  owned: {
    backgroundColor: '#fff', // Blanco brillante
    borderColor: 'gold',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});