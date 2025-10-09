import 'package:flutter/material.dart';

class ColorPickerWidget extends StatelessWidget {
  final String currentColor;
  final Function(String) onColorChanged;

  const ColorPickerWidget({
    super.key,
    required this.currentColor,
    required this.onColorChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Product Color',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          // Current color display
          Container(
            width: double.infinity,
            height: 60,
            decoration: BoxDecoration(
              color: _hexToColor(currentColor),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Center(
              child: Text(
                currentColor.toUpperCase(),
                style: TextStyle(
                  color: _getContrastColor(_hexToColor(currentColor)),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Predefined colors
          Text(
            'Quick Colors',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _predefinedColors.map((color) {
              final isSelected = color.toLowerCase() == currentColor.toLowerCase();
              return GestureDetector(
                onTap: () => onColorChanged(color),
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: _hexToColor(color),
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(
                      color: isSelected ? Colors.black : Colors.grey[300]!,
                      width: isSelected ? 3 : 1,
                    ),
                  ),
                  child: isSelected
                      ? Icon(
                          Icons.check,
                          color: _getContrastColor(_hexToColor(color)),
                          size: 24,
                        )
                      : null,
                ),
              );
            }).toList(),
          ),
          
          const SizedBox(height: 16),
          
          // Custom color input
          Text(
            'Custom Color',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: '#FFFFFF',
                    prefixText: '#',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  maxLength: 6,
                  onSubmitted: (value) {
                    if (_isValidHex(value)) {
                      onColorChanged('#$value');
                    }
                  },
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () {
                  // TODO: Implement color picker dialog
                  _showColorPickerDialog(context);
                },
                child: const Text('Pick'),
              ),
            ],
          ),
          
          const Spacer(),
          
          // Color presets for different product types
          Text(
            'Popular Combinations',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _colorCombinations.map((combo) {
                return Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: GestureDetector(
                    onTap: () => onColorChanged(combo['primary']!),
                    child: Column(
                      children: [
                        Container(
                          width: 60,
                          height: 40,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: _hexToColor(combo['primary']!),
                                    borderRadius: const BorderRadius.only(
                                      topLeft: Radius.circular(7),
                                      bottomLeft: Radius.circular(7),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: _hexToColor(combo['accent']!),
                                    borderRadius: const BorderRadius.only(
                                      topRight: Radius.circular(7),
                                      bottomRight: Radius.circular(7),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          combo['name']!,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Color _hexToColor(String hex) {
    final hexCode = hex.replaceAll('#', '');
    return Color(int.parse('FF$hexCode', radix: 16));
  }

  Color _getContrastColor(Color color) {
    final luminance = color.computeLuminance();
    return luminance > 0.5 ? Colors.black : Colors.white;
  }

  bool _isValidHex(String hex) {
    return RegExp(r'^[0-9A-Fa-f]{6}$').hasMatch(hex);
  }

  void _showColorPickerDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Advanced Color Picker'),
        content: const Text('Advanced color picker coming soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  static const List<String> _predefinedColors = [
    '#FFFFFF', // White
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
    '#808080', // Gray
    '#90EE90', // Light Green
    '#FFB6C1', // Light Pink
    '#87CEEB', // Sky Blue
  ];

  static const List<Map<String, String>> _colorCombinations = [
    {'name': 'Classic', 'primary': '#FFFFFF', 'accent': '#000000'},
    {'name': 'Ocean', 'primary': '#0077BE', 'accent': '#FFFFFF'},
    {'name': 'Sunset', 'primary': '#FF6B35', 'accent': '#F7931E'},
    {'name': 'Forest', 'primary': '#228B22', 'accent': '#90EE90'},
    {'name': 'Royal', 'primary': '#4B0082', 'accent': '#FFD700'},
    {'name': 'Fire', 'primary': '#DC143C', 'accent': '#FF4500'},
  ];
}