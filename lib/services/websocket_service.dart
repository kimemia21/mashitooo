import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import '../models/design_project.dart';

class WebSocketService {
  static const String wsUrl = 'ws://localhost:3000';
  
  WebSocketChannel? _channel;
  bool _isConnected = false;
  String? _currentProjectId;
  
  // Event callbacks
  Function(DesignProject)? onProjectUpdate;
  Function(String, Map<String, dynamic>)? onElementTransform;
  Function(String, String)? onColorChange;
  Function(String, String)? onRenderComplete;
  Function(String)? onConnectionStatusChange;

  bool get isConnected => _isConnected;
  String? get currentProjectId => _currentProjectId;

  Future<void> connect() async {
    try {
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
      _isConnected = true;
      onConnectionStatusChange?.call('connected');
      
      // Listen to incoming messages
      _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnection,
      );
      
      print('WebSocket connected successfully');
    } catch (e) {
      _isConnected = false;
      onConnectionStatusChange?.call('failed');
      print('WebSocket connection failed: $e');
    }
  }

  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message);
      final event = data['event'] ?? data['type'];
      
      switch (event) {
        case 'project:created':
          _handleProjectCreated(data['data']);
          break;
        case 'design:update':
          _handleDesignUpdate(data['data']);
          break;
        case 'element:transformed':
          _handleElementTransformed(data['data']);
          break;
        case 'color:changed':
          _handleColorChanged(data['data']);
          break;
        case 'render:complete':
          _handleRenderComplete(data['data']);
          break;
        case 'project:state':
          _handleProjectState(data);
          break;
        default:
          print('Unknown WebSocket event: $event');
      }
    } catch (e) {
      print('Error handling WebSocket message: $e');
    }
  }

  void _handleProjectCreated(Map<String, dynamic> data) {
    final projectId = data['projectId'];
    final project = DesignProject.fromJson(data['project']);
    onProjectUpdate?.call(project);
    print('Project created: $projectId');
  }

  void _handleDesignUpdate(Map<String, dynamic> data) {
    final projectId = data['projectId'];
    final action = data['action'];
    
    // You can implement more specific handling here
    if (kDebugMode) {
      print('Design update for project $projectId: $action');
    }
  }

  void _handleElementTransformed(Map<String, dynamic> data) {
    final elementId = data['elementId'];
    final transform = data['transform'];
    
    onElementTransform?.call(elementId, transform);
    print('Element $elementId transformed: $transform');
  }

  void _handleColorChanged(Map<String, dynamic> data) {
    final projectId = data['projectId'];
    final color = data['color'];
    
    onColorChange?.call(projectId, color);
    print('Color changed for project $projectId: $color');
  }

  void _handleRenderComplete(Map<String, dynamic> data) {
    final projectId = data['projectId'];
    final textureUrl = data['textureUrl'];
    
    onRenderComplete?.call(projectId, textureUrl);
    print('Render complete for project $projectId: $textureUrl');
  }

  void _handleProjectState(Map<String, dynamic> data) {
    try {
      final project = DesignProject.fromJson(data);
      onProjectUpdate?.call(project);
      print('Received project state update');
    } catch (e) {
      print('Error parsing project state: $e');
    }
  }

  void _handleError(error) {
    _isConnected = false;
    onConnectionStatusChange?.call('error');
    print('WebSocket error: $error');
  }

  void _handleDisconnection() {
    _isConnected = false;
    onConnectionStatusChange?.call('disconnected');
    print('WebSocket disconnected');
  }

  // Join a specific project room
  void joinProject(String projectId) {
    if (_isConnected && _channel != null) {
      _currentProjectId = projectId;
      final message = jsonEncode({
        'event': 'join:project',
        'data': projectId,
      });
      _channel!.sink.add(message);
      print('Joined project: $projectId');
    }
  }

  // Send element transformation updates
  void sendElementTransform({
    required String projectId,
    required String elementId,
    required Map<String, dynamic> transform,
  }) {
    if (_isConnected && _channel != null) {
      final message = jsonEncode({
        'event': 'design:transform',
        'data': {
          'projectId': projectId,
          'elementId': elementId,
          'transform': transform,
        },
      });
      _channel!.sink.add(message);
    }
  }

  // Send real-time design updates
  void sendDesignUpdate({
    required String projectId,
    required Map<String, dynamic> update,
  }) {
    if (_isConnected && _channel != null) {
      final message = jsonEncode({
        'event': 'design:update',
        'data': {
          'projectId': projectId,
          ...update,
        },
      });
      _channel!.sink.add(message);
    }
  }

  // Disconnect from WebSocket
  void disconnect() {
    if (_channel != null) {
      _channel!.sink.close(status.goingAway);
      _channel = null;
    }
    _isConnected = false;
    _currentProjectId = null;
    onConnectionStatusChange?.call('disconnected');
  }

  // Reconnect logic
  Future<void> reconnect() async {
    disconnect();
    await Future.delayed(const Duration(seconds: 1));
    await connect();
    
    if (_currentProjectId != null) {
      joinProject(_currentProjectId!);
    }
  }

  void dispose() {
    disconnect();
    onProjectUpdate = null;
    onElementTransform = null;
    onColorChange = null;
    onRenderComplete = null;
    onConnectionStatusChange = null;
  }
}