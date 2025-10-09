import 'package:flutter/material.dart';
import '../models/product.dart';

class TextEditorWidget extends StatefulWidget {
  final Function(String text, int fontSize, String color) onAddText;
  final List<DesignElement> currentTexts;
  final Function(String elementId) onRemoveText;

  const TextEditorWidget({
    super.key,
    required this.onAddText,
    required this.currentTexts,
    required this.onRemoveText,
  });

  @override
  State<TextEditorWidget> createState() => _TextEditorWidgetState();
}

class _TextEditorWidgetState extends State<TextEditorWidget> {
  final TextEditingController _textController = TextEditingController();
  int _selectedFontSize = 48;
  String _selectedColor = '#000000';
  String _selectedFont = 'Arial';

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Text input
          Text(
            'Add Text',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          
          TextField(
            controller: _textController,
            decoration: const InputDecoration(
              hintText: 'Enter your text...',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            maxLines: 2,
            maxLength: 100,
          ),
          
          const SizedBox(height: 16),
          
          // Font size selector
          Row(
            children: [
              Text(
                'Size: $_selectedFontSize',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              Expanded(
                child: Slider(
                  value: _selectedFontSize.toDouble(),
                  min: 12,
                  max: 120,
                  divisions: 27,
                  onChanged: (value) {
                    setState(() {
                      _selectedFontSize = value.round();
                    });
                  },
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          // Font family selector
          Row(
            children: [
              const Text('Font: '),
              Expanded(
                child: DropdownButton<String>(
                  value: _selectedFont,
                  isExpanded: true,
                  items: _fontFamilies.map((font) {
                    return DropdownMenuItem(
                      value: font,
                      child: Text(font),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _selectedFont = value;
                      });
                    }
                  },
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Color selector
          Text(
            'Text Color',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _textColors.map((color) {
              final isSelected = color == _selectedColor;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedColor = color;
                  });
                },
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _hexToColor(color),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? Colors.blue : Colors.grey[300]!,
                      width: isSelected ? 3 : 1,
                    ),
                  ),
                  child: isSelected
                      ? Icon(
                          Icons.check,
                          color: _getContrastColor(_hexToColor(color)),
                          size: 20,
                        )
                      : null,
                ),
              );
            }).toList(),
          ),
          
          const SizedBox(height: 16),
          
          // Preview
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
              color: Colors.grey[50],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Preview:',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 4),
                Text(
                  _textController.text.isEmpty ? 'Your text here' : _textController.text,
                  style: TextStyle(
                    fontSize: _selectedFontSize.toDouble() * 0.3, // Scaled down for preview
                    color: _hexToColor(_selectedColor),
                    fontFamily: _selectedFont,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Add button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _textController.text.trim().isNotEmpty ? _addText : null,
              icon: const Icon(Icons.add),
              label: const Text('Add Text'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(0, 48),
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Current texts list
          if (widget.currentTexts.isNotEmpty) ...[
            Text(
              'Current Texts',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
          ],
          
          Expanded(
            child: widget.currentTexts.isNotEmpty
                ? ListView.builder(
                    itemCount: widget.currentTexts.length,
                    itemBuilder: (context, index) {
                      final textElement = widget.currentTexts[index];
                      final text = textElement.properties['content'] ?? 'Text';
                      final fontSize = textElement.properties['fontSize'] ?? 48;
                      final color = textElement.properties['color'] ?? '#000000';
                      
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.text_fields),
                          title: Text(
                            text,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: _hexToColor(color),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          subtitle: Text(
                            'Size: $fontSize, Position: (${textElement.position.x.toStringAsFixed(2)}, ${textElement.position.y.toStringAsFixed(2)})',
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () {
                              widget.onRemoveText(textElement.id);
                            },
                          ),
                        ),
                      );
                    },
                  )
                : const Center(
                    child: Text(
                      'No text elements added yet\nAdd some text to get started',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  void _addText() {
    final text = _textController.text.trim();
    if (text.isNotEmpty) {
      widget.onAddText(text, _selectedFontSize, _selectedColor);
      _textController.clear();
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Text added successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  Color _hexToColor(String hex) {
    final hexCode = hex.replaceAll('#', '');
    return Color(int.parse('FF$hexCode', radix: 16));
  }

  Color _getContrastColor(Color color) {
    final luminance = color.computeLuminance();
    return luminance > 0.5 ? Colors.black : Colors.white;
  }

  static const List<String> _fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Palatino',
  ];

  static const List<String> _textColors = [
    '#000000', // Black
    '#FFFFFF', // White
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
    '#FFD700', // Gold
    '#C0C0C0', // Silver
    '#800000', // Maroon
  ];
}