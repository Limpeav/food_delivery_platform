import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../shared/models/category_model.dart';
import '../../data/search_repository.dart';
import 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final SearchRepository _searchRepository;
  List<CategoryModel> _cachedCategories = [];
  String _currentQuery = '';
  int? _currentCategoryId;

  SearchBloc({required SearchRepository searchRepository})
      : _searchRepository = searchRepository,
        super(SearchInitial()) {
    on<SearchInitRequested>(_onSearchInitRequested);
    on<SearchQueryChanged>(_onSearchQueryChanged);
    on<SearchCategorySelected>(_onSearchCategorySelected);
  }

  Future<void> _onSearchInitRequested(
    SearchInitRequested event,
    Emitter<SearchState> emit,
  ) async {
    emit(const SearchLoading());
    try {
      _cachedCategories = await _searchRepository.getCategories();
      await _executeSearch(emit);
    } catch (e) {
      emit(SearchError(e.toString()));
    }
  }

  Future<void> _onSearchQueryChanged(
    SearchQueryChanged event,
    Emitter<SearchState> emit,
  ) async {
    _currentQuery = event.query;
    await _executeSearch(emit);
  }

  Future<void> _onSearchCategorySelected(
    SearchCategorySelected event,
    Emitter<SearchState> emit,
  ) async {
    _currentCategoryId = event.categoryId == _currentCategoryId ? null : event.categoryId;
    await _executeSearch(emit);
  }

  Future<void> _executeSearch(Emitter<SearchState> emit) async {
    emit(
      SearchLoading(
        categories: _cachedCategories,
        selectedCategoryId: _currentCategoryId,
        query: _currentQuery,
      ),
    );

    try {
      final results = await Future.wait([
        _searchRepository.searchRestaurants(
          query: _currentQuery,
          categoryId: _currentCategoryId,
        ),
        _searchRepository.searchFoods(
          query: _currentQuery,
          categoryId: _currentCategoryId,
        ),
      ]);

      final restaurants = results[0] as dynamic;
      final foods = results[1] as dynamic;

      emit(
        SearchLoaded(
          categories: _cachedCategories,
          restaurants: restaurants,
          foods: foods,
          selectedCategoryId: _currentCategoryId,
          query: _currentQuery,
        ),
      );
    } catch (e) {
      emit(SearchError(e.toString()));
    }
  }
}
