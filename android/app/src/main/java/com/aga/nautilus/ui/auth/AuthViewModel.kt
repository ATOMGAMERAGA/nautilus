package com.aga.nautilus.ui.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aga.nautilus.core.datastore.TokenManager
import com.aga.nautilus.data.remote.api.LoginRequest
import com.aga.nautilus.data.remote.api.NautilusApi
import com.aga.nautilus.data.remote.api.RegisterRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import retrofit2.HttpException
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val api: NautilusApi,
    private val tokenManager: TokenManager
) : ViewModel() {

    var isLoading by mutableStateOf(false)
    var error by mutableStateOf<String?>(null)

    fun login(username: String, password: String, onSuccess: () -> Unit) {
        if (username.isBlank() || password.isBlank()) {
            error = "Fields cannot be empty"
            return
        }
        
        viewModelScope.launch {
            isLoading = true
            error = null
            try {
                val response = api.login(LoginRequest(username, password))
                tokenManager.saveToken(response.access_token)
                onSuccess()
            } catch (e: HttpException) {
                error = "Login failed: ${e.response()?.errorBody()?.string() ?: e.message()}"
            } catch (e: Exception) {
                error = e.localizedMessage ?: "Login failed"
            } finally {
                isLoading = false
            }
        }
    }

    fun register(username: String, password: String, onSuccess: () -> Unit) {
        // Client-side validation to match server schema
        if (username.length < 3) {
            error = "Username must be at least 3 characters"
            return
        }
        if (!username.matches(Regex("^[a-zA-Z0-9_]+$"))) {
            error = "Username can only contain letters, numbers and underscores"
            return
        }
        if (password.length < 8) {
            error = "Password must be at least 8 characters"
            return
        }

        viewModelScope.launch {
            isLoading = true
            error = null
            try {
                val response = api.register(RegisterRequest(username, password))
                tokenManager.saveToken(response.access_token)
                onSuccess()
            } catch (e: HttpException) {
                // Parse server-side Zod errors if possible, otherwise show raw body
                val errorBody = e.response()?.errorBody()?.string()
                error = "Registration failed: $errorBody"
            } catch (e: Exception) {
                error = e.localizedMessage ?: "Registration failed"
            } finally {
                isLoading = false
            }
        }
    }
}
