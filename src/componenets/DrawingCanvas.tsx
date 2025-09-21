import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  onClose: () => void;
};

const colors = ['red', 'blue', 'green', 'black'];

const DrawingCanvas = ({ onClose }: Props) => {
  const [currentColor, setCurrentColor] = useState('black');
  const [paths, setPaths] = useState<{ color: string; d: string }[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  const handleTouchMove = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    setCurrentPath((prev) => prev + ` L${locationX} ${locationY}`);
  };

  const handleTouchEnd = () => {
    if (currentPath) {
      setPaths([...paths, { color: currentColor, d: `M${currentPath}` }]);
      setCurrentPath('');
    }
  };

  return (
    <View style={styles.overlay}>
      <Svg style={StyleSheet.absoluteFill}>
        {paths.map((p, i) => <Path key={i} d={p.d} stroke={p.color} strokeWidth={3} fill="none" />)}
        {currentPath ? <Path d={`M${currentPath}`} stroke={currentColor} strokeWidth={3} fill="none" /> : null}
      </Svg>

      <View style={styles.colorBar}>
        {colors.map((c) => (
          <TouchableOpacity key={c} style={[styles.colorBox, { backgroundColor: c }]} onPress={() => setCurrentColor(c)} />
        ))}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <View />
        </TouchableOpacity>
      </View>

      <View
        style={StyleSheet.absoluteFill}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </View>
  );
};

export default DrawingCanvas;

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  colorBar: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  colorBox: { width: 30, height: 30, margin: 5, borderRadius: 15 },
  closeBtn: { width: 30, height: 30, margin: 5, backgroundColor: 'white', borderRadius: 15 },
});
