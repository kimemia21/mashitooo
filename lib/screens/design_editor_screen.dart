import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';
import '../services/design_controller.dart';
import '../models/product.dart';
import '../widgets/color_picker_widget.dart';
import '../widgets/text_editor_widget.dart';

class DesignEditorScreen extends StatefulWidget {
  final Product product;

  const DesignEditorScreen({
    super.key,
    required this.product,
  });

  @override
  State<DesignEditorScreen> createState() => _DesignEditorScreenState();
}

class _DesignEditorScreenState extends State<DesignEditorScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  Flutter3DController controller3D = Flutter3DController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Customize ${widget.product.name}'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          Consumer<DesignController>(
            builder: (context, controller, child) {
              return IconButton(
                icon: const Icon(Icons.download),
                onPressed: controller.currentProject != null
                    ? () => _renderFinalTexture(controller)
                    : null,
                tooltip: 'Render & Export',
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 3D Preview Area
          Expanded(
            flex: 3,
            child: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Consumer<DesignController>(
                  builder: (context, controller, child) {
                    if (controller.isLoading) {
                      return const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 16),
                            Text('Loading 3D model...'),
                          ],
                        ),
                      );
                    }

                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Flutter3DViewer(
                        src: widget.product.modelUrl,
                        controller: controller3D,
                        progressBarColor: Colors.blue,
                      ),
                    );
                  },
                ),
              ),
            ),
          ),

          // Tools Area
          Expanded(
            flex: 2,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey[50],
                border: Border(
                  top: BorderSide(color: Colors.grey[300]!),
                ),
              ),
              child: Column(
                children: [
                  // Tab Bar
                  TabBar(
                    controller: _tabController,
                    tabs: const [
                      Tab(icon: Icon(Icons.palette), text: 'Color'),
                      Tab(icon: Icon(Icons.image), text: 'Stickers'),
                      Tab(icon: Icon(Icons.text_fields), text: 'Text'),
                      Tab(icon: Icon(Icons.preview), text: 'Preview'),
                    ],
                    labelColor: Colors.blue,
                    unselectedLabelColor: Colors.grey,
                    indicatorColor: Colors.blue,
                  ),

                  // Tab Content
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildColorTab(),
                        _buildStickersTab(),
                        _buildTextTab(),
                        _buildPreviewTab(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildColorTab() {
    return Consumer<DesignController>(
      builder: (context, controller, child) {
        return ColorPickerWidget(
          currentColor: controller.currentProject?.baseColor ?? '#ffffff',
          onColorChanged: (color) {
            controller.updateProjectColor(color);
          },
        );
      },
    );
  }

  Widget _buildStickersTab() {
    return Consumer<DesignController>(
      builder: (context, controller, child) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              ElevatedButton.icon(
                onPressed: () => _pickStickerFile(controller),
                icon: const Icon(Icons.add_photo_alternate),
                label: const Text('Add Sticker'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
              ),
              const SizedBox(height: 16),
              
              // Display current stickers
              Expanded(
                child: controller.currentProject?.hasElements == true
                    ? ListView.builder(
                        itemCount: controller.currentProject!
                            .getElementsByType('sticker').length,
                        itemBuilder: (context, index) {
                          final sticker = controller.currentProject!
                              .getElementsByType('sticker')[index];
                          return Card(
                            child: ListTile(
                              leading: const Icon(Icons.image),
                              title: Text('Sticker ${index + 1}'),
                              subtitle: Text(
                                'Position: (${sticker.position.x.toStringAsFixed(2)}, ${sticker.position.y.toStringAsFixed(2)})'
                              ),
                              trailing: IconButton(
                                icon: const Icon(Icons.delete),
                                onPressed: () {
                                  controller.removeElement(sticker.id);
                                },
                              ),
                            ),
                          );
                        },
                      )
                    : const Center(
                        child: Text(
                          'No stickers added yet\nTap "Add Sticker" to get started',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTextTab() {
    return Consumer<DesignController>(
      builder: (context, controller, child) {
        return TextEditorWidget(
          onAddText: (text, fontSize, color) {
            controller.addText(
              text: text,
              fontSize: fontSize,
              color: color,
            );
          },
          currentTexts: controller.currentProject?.getElementsByType('text') ?? [],
          onRemoveText: (elementId) {
            controller.removeElement(elementId);
          },
        );
      },
    );
  }

  Widget _buildPreviewTab() {
    return Consumer<DesignController>(
      builder: (context, controller, child) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              if (controller.latestRenderUrl != null) ...[
                const Text(
                  'Latest Render:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: Image.network(
                    'http://localhost:3000${controller.latestRenderUrl}',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Center(
                        child: Text('Failed to load render'),
                      );
                    },
                  ),
                ),
              ] else ...[
                const Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.image_not_supported,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'No render available',
                          style: TextStyle(color: Colors.grey),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Tap the download button to generate a render',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _renderFinalTexture(controller),
                      icon: const Icon(Icons.refresh),
                      label: const Text('Generate Render'),
                    ),
                  ),
                  if (controller.latestRenderUrl != null) ...[
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        // TODO: Implement download functionality
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Download functionality coming soon!'),
                          ),
                        );
                      },
                      icon: const Icon(Icons.download),
                      label: const Text('Download'),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickStickerFile(DesignController controller) async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
      );

      if (result != null && result.files.single.path != null) {
        await controller.addStickerFromFile(
          result.files.single.path!,
          x: 0.5,
          y: 0.5,
          width: 200,
          height: 200,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Sticker added successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add sticker: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _renderFinalTexture(DesignController controller) async {
    if (controller.currentProject == null) return;

    try {
      await controller.renderFinalTexture();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Render generated successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        // Switch to preview tab
        _tabController.animateTo(3);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to render: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}