package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ListUsersView extends PO_NavView{
	
	
	
	static public void deleteUser1(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/usuarios");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr/td[4]/input"));
		elementos.get(0).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();
		driver.navigate().to("https://localhost:8081/usuarios");
	}
	
	static public String getUser1(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/usuarios");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr/td[4]/input"));
		return elementos.get(0).getAttribute("id");
	}
	
	
	static public void deleteLastUser(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/usuarios");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr"));
		int n = elementos.size();
		String s = "/html/body/div/div/table/tbody[1]/tr[" + (n) + "]/td[4]/input";
		List<WebElement> elementos2 = driver.findElements(By.xpath(s));
		elementos2.get(0).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();
		driver.navigate().to("https://localhost:8081/usuarios");
	}
	
	static public void delete3LastUsers(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/usuarios");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr"));
		int n = elementos.size();
		String s = "/html/body/div/div/table/tbody[1]/tr[" + (n-2) + "]/td[4]/input";
		List<WebElement> elementos2 = driver.findElements(By.xpath(s));
		elementos2.get(0).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();
		driver.navigate().to("https://localhost:8081/usuarios");
		
		String s1 = "/html/body/div/div/table/tbody[1]/tr[" + (n-2) + "]/td[4]/input";
		List<WebElement> elementos3 = driver.findElements(By.xpath(s1));
		elementos3.get(0).click();
		By boton2 = By.className("btn");
		driver.findElement(boton2).click();
		driver.navigate().to("https://localhost:8081/usuarios");
		
		String s2 = "/html/body/div/div/table/tbody[1]/tr[" + (n-2) + "]/td[4]/input";
		List<WebElement> elementos4 = driver.findElements(By.xpath(s2));
		elementos4.get(0).click();
		By boton3 = By.className("btn");
		driver.findElement(boton3).click();
		driver.navigate().to("https://localhost:8081/usuarios");
		
	}
	

}
