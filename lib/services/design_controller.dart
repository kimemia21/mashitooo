import 'dart:io';

import 'package:flutter/foundation.dart';
import '../models/design_project.dart';
import '../models/product.dart';
import 'api_service.dart';
import 'websocket_service.dart';

class DesignController extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final WebSocketService _wsService = WebSocketService();
  
  DesignProject? _currentProject;
  List<Product> _availableProducts = [];
  bool _isLoading = false;
  String? _error;
  String? _connectionStatus;
  String? _latestRenderUrl;

  // Getters
  DesignProject? get currentProject => _currentProject;
  List<Product> get availableProducts => _availableProducts;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get connectionStatus => _connectionStatus;
  String? get latestRenderUrl => _latestRenderUrl;
  bool get isConnected => _wsService.isConnected;

  DesignController() {
    _initializeWebSocket();
    _loadAvailableProducts();
  }

  void _initializeWebSocket() {
    _wsService.onProjectUpdate = (project) {
      _currentProject = project;
      notifyListeners();
    };

    _wsService.onColorChange = (projectId, color) {
      if (_currentProject?.id == projectId) {
        _currentProject = _currentProject!.copyWith(baseColor: color);
        notifyListeners();
      }
    };

    _wsService.onRenderComplete = (projectId, textureUrl) {
      if (_currentProject?.id == projectId) {
        _latestRenderUrl = textureUrl;
        notifyListeners();
      }
    };

    _wsService.onConnectionStatusChange = (status) {
      _connectionStatus = status;
      notifyListeners();
    };

    _wsService.connect();
  }

  Future<void> _loadAvailableProducts() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _availableProducts = await _apiService.getAvailableModels();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createProject({
    String modelType = 'tshirt',
    String baseColor = '#ffffff',
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _currentProject = await _apiService.createProject(
        modelType: modelType,
        baseColor: baseColor,
      );

      // Join the WebSocket room for this project
      if (_currentProject != null) {
        _wsService.joinProject(_currentProject!.id);
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadProject(String projectId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _currentProject = await _apiService.getProject(projectId);
      _wsService.joinProject(projectId);

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addStickerFromFile(
    String filePath, {
    double x = 0.5,
    double y = 0.5,
    double width = 0.2,
    double height = 0.2,
    double rotation = 0,
  }) async {
    if (_currentProject == null) return;

    try {
      _isLoading = true;
      notifyListeners();

      // Upload the sticker file
      final uploadResult = await _apiService.uploadSticker(
        File(filePath),
      );

      // Add sticker to project
      final element = await _apiService.addSticker(
        projectId: _currentProject!.id,
        stickerId: uploadResult['stickerId'],
        stickerUrl: uploadResult['stickerUrl'],
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: rotation,
      );

      _currentProject = _currentProject!.addElement(element);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addText({
    required String text,
    double x = 0.5,
    double y = 0.5,
    int fontSize = 48,
    String fontFamily = 'Arial',
    String color = '#000000',
  }) async {
    if (_currentProject == null) return;

    try {
      _isLoading = true;
      notifyListeners();

      final element = await _apiService.addText(
        projectId: _currentProject!.id,
        text: text,
        x: x,
        y: y,
        fontSize: fontSize,
        fontFamily: fontFamily,
        color: color,
      );

      _currentProject = _currentProject!.addElement(element);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProjectColor(String color) async {
    if (_currentProject == null) return;

    try {
      await _apiService.updateColor(
        projectId: _currentProject!.id,
        color: color,
      );

      _currentProject = _currentProject!.copyWith(baseColor: color);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> renderFinalTexture({
    int width = 2048,
    int height = 2048,
  }) async {
    if (_currentProject == null) return;

    try {
      _isLoading = true;
      notifyListeners();

      final renderResult = await _apiService.renderTexture(
        projectId: _currentProject!.id,
        width: width,
        height: height,
      );

      _latestRenderUrl = renderResult.textureUrl;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void transformElement({
    required String elementId,
    Position3D? position,
    Scale3D? scale,
    Rotation3D? rotation,
  }) {
    if (_currentProject == null) return;

    final element = _currentProject!.getElementById(elementId);
    if (element == null) return;

    final updatedElement = element.copyWith(
      position: position ?? element.position,
      scale: scale ?? element.scale,
      rotation: rotation ?? element.rotation,
      timestamp: DateTime.now(),
    );

    _currentProject = _currentProject!.updateElement(elementId, updatedElement);
    
    // Send real-time update via WebSocket
    _wsService.sendElementTransform(
      projectId: _currentProject!.id,
      elementId: elementId,
      transform: {
        'position': position?.toJson(),
        'scale': scale?.toJson(),
        'rotation': rotation?.toJson(),
      },
    );

    notifyListeners();
  }

  void removeElement(String elementId) {
    if (_currentProject == null) return;

    _currentProject = _currentProject!.removeElement(elementId);
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> reconnectWebSocket() async {
    await _wsService.reconnect();
  }

  @override
  void dispose() {
    _wsService.dispose();
    super.dispose();
  }
}