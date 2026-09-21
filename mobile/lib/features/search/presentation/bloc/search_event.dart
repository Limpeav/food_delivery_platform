import 'package:equatable/equatable.dart';

abstract class SearchEvent extends Equatable {
  const SearchEvent();

  @override
  List<Object?> get props => [];
}

class SearchInitRequested extends SearchEvent {}

class SearchQueryChanged extends SearchEvent {
  final String query;

  const SearchQueryChanged(this.query);

  @override
  List<Object?> get props => [query];
}

class SearchCategorySelected extends SearchEvent {
  final int? categoryId;

  const SearchCategorySelected(this.categoryId);

  @override
  List<Object?> get props => [categoryId];
}
